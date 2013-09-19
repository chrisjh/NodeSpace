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
var redis = require('redis');

/**
 * Setup Express and Redis
 */
var app = express();

var client = redis.createClient();
log('info', 'connected to redis server');

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

/*
    Version 0.0.2 Test
 */
io.socket.on('connection', function(client) {
    var subscribe = redis.createClient();
    subscribe.subscribe('realtime');

    subscribe.on("message", function(channel, message) {
        client.send(message);
        log('msg', "received from channel #" + channel + " : " + message);
    });

    client.on('message', function(msg) {
        log('debug', msg);
    });

    client.on('disconnect', function() {
        log('warn', 'disconnecting from redis');
        subscribe.quit();
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

/*
    Version 0.0.1 Test
 */
/*io.sockets.on('connection', function(socket) {
    socket.emit('news', {
        hello: 'world'
    });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});*/
