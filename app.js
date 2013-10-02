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
var mongoose = require('mongoose');

/**
 * Setup Express and Mongo
 */
var app = express();

var db = mongoose.connect('mongodb://localhost/nodespace', function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MongoDB!');
    }
});

var conn = mongoose.connection;

var NodeSpaceSchema = mongoose.Schema({});
var Data = mongoose.model('Data', NodeSpaceSchema);
var data = new Data();

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
    Version 0.0.4 Test
 */
var users = {};
var counter = 0;

io.sockets.on('connection', function(socket) {

    counter++;
    console.log('TOTAL CONNECTION NUMBER = ' + counter);

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

    socket.on('findDocument', function(documentData) {
        console.log('Finding document: ' + documentData);
        var result;

        conn.collection('aaa').find(documentData, function(err, result) {
            //TODO handle error
            console.log(result.tuple)
            console.log('Found document.');
            socket.emit('foundDoc', {
                'foundTuple': 'yes',
                'tupleIs': result.tuple
            });
            /*if(documentData == result.tuple){
                console.log('Found document.');
                socket.emit('foundDoc', {
                    'foundTuple': 'yes',
                    'tupleIs': result.tuple
                });
            } else {
                console.log('Could not find document.');
                socket.emit('foundDoc', {
                    'foundTuple': 'no tuple found'
                });
            }*/
        });
    });

    socket.on('addDocument', function(documentData) {
        console.log('Adding document: ' + documentData);

        conn.collection('aaa').insert(documentData, function(err, inserted) {
            //TODO handle error
            console.log('Document added.');
        });
    });

    /* socket.on('adduser', function(user) {
        if (users[user] == user) {
            socket.emit('sign', {
                state: 0
            });
        } else {
            socket.user = user;
            users[user] = user;
            socket.emit('sign', {
                state: 1
            });
            // Send objects to the new client
            Data.find({}, function(err, docs) {
                if (err) {
                    throw err;
                }
                socket.emit('objects', docs);
            });
            io.sockets.emit('update', users);
        }
    });*/

    socket.on('disconnect', function() {
        //mongoose.disconnect();
        //delete users[socket.user];
        //io.sockets.emit('update', users);
        counter--;
        console.log('TOTAL CONNECTION NUMBER = ' + counter);
        io.sockets.emit('pageview', {
            'connections': Object.keys(io.connected).length
        });

        if (counter == 0) {
            console.log('Removing tuples from the space...');
            conn.collection('aaa').drop(function(err, drop) {
                //TODO handle error
            });
        }
    });
});

function log(type, msg) {

    var color = '\u001b[0m',
        reset = '\u001b[0m';

    switch (type) {
        case "info":
            color = '\u001b[36m';
            break;
        case "warn":
            color = '\u001b[33m';
            break;
        case "error":
            color = '\u001b[31m';
            break;
        case "msg":
            color = '\u001b[34m';
            break;
        default:
            color = '\u001b[0m';
    }
    console.log(color + '   ' + type + '  - ' + reset + msg);
}
