// Production and development environment variables
var isProduction = process.env.NODE_ENV === 'production';
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

function p(e) {
    console.log(e);
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
                    console.log('Could not find tuple... Adding a new one...');
                    collection.insert(constructJson, function(err, inserted) {
                        //TODO handle error
                        console.log('Document added.');
                    });
                } else {
                    final_result = JSON.parse(edited_result);
                    if (JSON.stringify(constructJson) === JSON.stringify(final_result)) {
                        console.log('Found document: ' + JSON.stringify(final_result));
                        console.log('No need to add another...');
                    }
                }
            }
        });
    });

    //Processing for read()
    socket.on('findDocument', function(input) {

        var inputString = input.toString();
        var inputArray = inputString.split(',');
        var inputCheckJSON = IsValidJson(input);
        var inputStringify = JSON.stringify(input);
        var inputJSON = JSON.parse(inputStringify);

        p("### INPUT STRING ###");
        p(inputString);
        p("");

        p("### INPUT ARRAY ###");
        p(inputArray);
        p("");

        p("### INPUT CHECK JSON ###");
        p(inputCheckJSON);
        p("");

        p("### INPUT STRINGIFY ###");
        p(inputStringify);
        p("");

        p("### INPUT JSON ###");
        p(inputJSON);
        p("");


        // Parse comma seperated list to JSON
        var constructJSON = {
            object: inputString.replace(/,$/, "").split(",").map(function(value) {
                return {
                    i: value
                };
            })
        };

        // Find wildcards
        // var regexp = /.*/;
        // var wildcards = [];

        // for (var i = 0; i < array.length; i++) {
        //     if (array[i] == "?"){
        //         wildcards[i] = regexp;
        //     } else {
        //         wildcards[i] = array[i];
        //     }
        // }
        // 

        //inputTest = { object: { $elemMatch : { i: /h*/, i: /w*/, i:/.*/ } } };
        var reg = /.*/i;
        //inputTest = { object: { $elemMatch : { i: /chr/i} } };
        //var query = { i: reg, i: 'hendel'};
        //
        var query = inputString.replace(/,$/, "").split(",").map(function(value) {
            if (value == "?") {
                return {
                    i: reg
                }
            } else {
                return {
                    i: value
                }
            }
        });

        var queryString = query.toString();
        var queryArray = queryString.split(',');
        var queryCheckJSON = IsValidJson(query);
        var queryStringify = JSON.stringify(query);
        var queryJSON = JSON.parse(queryStringify);

        p("### query STRING ###");
        p(queryString);
        p("");

        p("### query ARRAY ###");
        p(queryArray);
        p("");

        p("### query CHECK JSON ###");
        p(queryCheckJSON);
        p("");

        p("### query STRINGIFY ###");
        p(queryStringify);
        p("");

        p("### query JSON ###");
        p(queryJSON);
        p("");

        p("The first element is....");
        p(query[0].i);

        //var queryMatch = { }
        var queryMatch = {};

        for (var x = 0; x < inputArray.length; x++){
            if(inputArray[x] == "?"){
                queryMatch['i'+x] = reg;
            } else {
                queryMatch['i'+x] = inputArray[x];
            }
        }

        var queryMatchString = queryMatch.toString();
        var queryMatchArray = queryMatchString.split(',');
        var queryMatchCheckJSON = IsValidJson(queryMatch);
        var queryMatchStringify = JSON.stringify(queryMatch);
        var queryMatchJSON = JSON.parse(queryMatchStringify);

        p("### queryMatch STRING ###");
        p(queryMatchString);
        p("");

        p("### queryMatch ARRAY ###");
        p(queryMatchArray);
        p("");

        p("### queryMatch CHECK JSON ###");
        p(queryMatchCheckJSON);
        p("");

        p("### queryMatch STRINGIFY ###");
        p(queryMatchStringify);
        p("");

        p("### queryMatch JSON ###");
        p(queryMatchJSON);
        p("");

        var inputTest = {
            object: {
                $elemMatch: { i: 'chris', i: 'hendel' }
            }
        };

        var inputTestString = inputTest.toString();
        var inputTestArray = inputTestString.split(',');
        var inputTestCheckJSON = IsValidJson(inputTest);
        var inputTestStringify = JSON.stringify(inputTest);
        var inputTestJSON = JSON.parse(inputTestStringify);

        p("### inputTest STRING ###");
        p(inputTestString);
        p("");

        p("### inputTest ARRAY ###");
        p(inputTestArray);
        p("");

        p("### inputTest CHECK JSON ###");
        p(inputTestCheckJSON);
        p("");

        p("### inputTest STRINGIFY ###");
        p(inputTestStringify);
        p("");

        p("### inputTest JSON ###");
        p(inputTestJSON);
        p("");

        collection.find(inputTest, {
            _id: 0
        }, function(err, result) {
            if (err) {
                p(err);
                p('There was an error finding the document.');
            } else {
                var resultString = result.toString();
                var resultArray = resultString.split(',');
                var resultJSON = IsValidJson(result);
                var resultStringify = JSON.stringify(result);

                p("### RESULT STRING ###");
                p(resultString);
                p("");

                p("### RESULT ARRAY ###");
                p(resultArray);
                p("");

                p("### RESULT JSON ###");
                p(resultJSON);
                p("");

                p("### RESULT STRINGIFY ###");
                p(resultStringify);
                p("");
            }
        });


    });


    //Processing for read()
    socket.on('takeDocument', function(tuples) {

        tuples = tuples.toString();

        var constructJson = {
            object: tuples.replace(/,$/, "").split(",").map(function(tuple) {
                return {
                    i: tuple
                };
            })
        };

        console.log('Trying to take tuple ' + JSON.stringify(constructJson));

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
                    socket.emit('foundTakeDocument', {
                        'foundTuple': 'no'
                    });
                } else {
                    final_result = JSON.parse(edited_result);
                    if (JSON.stringify(constructJson) === JSON.stringify(final_result)) {
                        console.log('Found document: ' + JSON.stringify(final_result));
                        socket.emit('foundTakeDocument', {
                            'foundTuple': 'yes',
                            'tuple': final_result
                        });
                        console.log("Removing tuple");
                        collection.remove(constructJson, {
                            _id: 0
                        }, function(err, res) {});
                    }
                }
            }
        });
    });

    socket.on('dropSpace', function() {
        console.log('dropping the space');
        collection.drop();
        socket.emit('spaceDropped', {
            'isDropped': 'yes'
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
