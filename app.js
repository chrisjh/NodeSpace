// Production and development environment variables
var isProduction = process.env.NODE_ENV === 'localhost';
var devPort = 8888;

// Module dependencies
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var mongojs = require('mongojs');

/**
 * Setup Express and Mongo
 */
var app = express();

var db = mongojs('nodespace');
var collection = db.collection('space');

var app = express();

// All environments
app.configure(function() {
    app.set('port', process.env.PORT || devPort);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

// Development only
app.configure('development', function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

// http routes
app.get('/', routes.index);
app.get('/users', user.list);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

var io = socketio.listen(server);

// Socket connection config
io.configure('production', function() {
    io.enable('browser client etag');
    io.set('log level', 1);

    io.set('transports', [
        'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
    ]);
});

io.configure('development', function() {
    io.set('transports', ['websocket']);
});

io.configure(function() {
    io.set('authorization', function(handshakeData, callback) {
        if (handshakeData.xdomain) {
            callback('Cross-domain connections are not allowed');
        } else {
            callback(null, true);
        }
    });
});

/*
    Version 0.1.1 Test
 */
var users = {};
var counter = 0;

function IsValidJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

io.sockets.on('connection', function(socket) {

    counter++;
    console.log('TOTAL CONNECTION NUMBER = ' + counter);

    //Server receives a message that is not find, retreive, or add

    socket.on('message', function(message) {
        console.log("Got message: " + message);
        ip = socket.handshake.address.address;
        url = message;
        io.sockets.emit('pageview', {
            'connections': Object.keys(io.connected).length,
            'ip': '***.***.***.' + ip.substring(ip.lastIndexOf('.') + 1),
            'url': url,
            'xdomain': socket.handshake.xdomain,
            'timestamp': new Date()
        });
    });

    //Processing for put()
    socket.on('addDocument', function(tuples) {

        tuples = tuples.toString();

        var constructJson = {
            object: tuples.replace(/,$/, "").split(",").map(function(tuple) {
                return {
                    i: tuple
                };
            })
        };

        console.log('Adding document: ' + JSON.stringify(constructJson));

        collection.insert(constructJson, function(err, inserted) {
            //TODO handle error
            console.log('Document added.');
        });
    });

    //Processing for read()
    socket.on('findDocument', function(tuples) {

        tuples = tuples.toString();
	var wildcard = "/.*/";	
//	var wildcard = new RegExp(".*");

//	console.log(wildcard);	


	if (tuples.indexOf("?")>0){
		console.log(tuples.indexOf("?"));
		console.log('in if loop');
		console.log(tuples);
		tuples = tuples.replace("?", wildcard);
//		tuples = tuples.replace("?", "/.*/");
		console.log(tuples);
	}

	console.log(tuples);	

	 var constructJson = {
            object: tuples.replace(/,$/, "").split(",").map(function(tuple) {
		 return {
                    i: tuple
                };
            })
        };


        console.log('Trying to find tuple ' + JSON.stringify(constructJson));

        collection.find(constructJson, {
            _id: 0
        }, function(err, result) {

            if (err) {
                console.log(err);
                console.log('There was an error finding the document.');
            } else {

                var edited_result = JSON.stringify(result);
                edited_result = edited_result.substring(1);
                edited_result = edited_result.substring(0, edited_result.length - 1);

                if (!IsValidJson(edited_result)) {
                    console.log('Could not find tuple.');
                    socket.emit('foundDocument', {
                        'foundTuple': 'no'
                    });
                } else {
                    final_result = JSON.parse(edited_result);
                    if (JSON.stringify(constructJson) === JSON.stringify(final_result)) {
                        console.log('Found document: ' + JSON.stringify(final_result));
                        socket.emit('foundDocument', {
                            'foundTuple': 'yes',
                            'tuple': final_result
                        });
                    }
                }
            }
        });
    });

    //TODO: Actually remove tuples from the space.
    //Processing for take()
    socket.on('takeDocument', function(documentData) {
        console.log('Taking document: ' + JSON.stringify(documentData));

        collection.find(documentData, {
            _id: 0
        }, function(err, result) {

            if (err) {
                console.log(err);
                console.log('There was an error finding the document.');
            } else {

                var edited_result = JSON.stringify(result);
                edited_result = edited_result.substring(1);
                edited_result = edited_result.substring(0, edited_result.length - 1);

                if (!IsValidJson(edited_result)) {
                    console.log('Could not find tuple.');
                    socket.emit('foundDocument', {
                        'foundTuple': 'no'
                    });
                } else {
                    final_result = JSON.parse(edited_result);
                    if (JSON.stringify(documentData) === JSON.stringify(final_result)) {
                        console.log('Found document: ' + JSON.stringify(final_result));
                        socket.emit('foundDocument', {
                            'foundTuple': 'yes',
                            'tupleIs': final_result
                        });
                    }
                }
            }
        });
    });


    socket.on('disconnect', function() {
        counter--;
        console.log('TOTAL CONNECTION NUMBER = ' + counter);
        io.sockets.emit('pageview', {
            'connections': Object.keys(io.connected).length
        });

        /*if (counter == 0) {
            console.log('Removing tuples from the space...');
            conn.collection('aaa').drop(function(err, drop) {
                //TODO handle error
            });
        }*/
    });
});
