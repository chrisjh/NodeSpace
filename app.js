// Production and development environment variables
var isProduction = false;
var port;
if (isProduction) {
    process.env.NODE_ENV === 'production';
    port = 80;
} else {
    process.env.NODE_ENV === 'development';
    port = 8888;
}

// Module dependencies
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var mongojs = require('mongojs');

/**
 * Setup Express and MongoDB
 */
var app = express();
var db = mongojs('nodespace');
var collection = db.collection('space');

// All environments
app.configure(function() {
    app.set('port', process.env.PORT || port);
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

var debug = false;

io.sockets.on('connection', function(socket) {

    counter++;
    p("### Total connected clients: " + counter);
    socket.emit('clientConnected', {
        'count': counter
    });

    //Processing for put()
    socket.on('addDocument', function(input) {

        var inputString = input.toString();
        var inputArray = inputString.split(',');
        var inputCheckJSON = IsValidJson(input);
        var inputStringify = JSON.stringify(input);
        var inputJSON = JSON.parse(inputStringify);

        if (debug) {
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
        }

        var inputData = {};

        for (var x = 0; x < inputArray.length; x++) {
            inputData['i' + x] = inputArray[x];
        }

        var inputDataString = inputData.toString();
        var inputDataArray = inputDataString.split(',');
        var inputDataCheckJSON = IsValidJson(inputData);
        var inputDataStringify = JSON.stringify(inputData);
        var inputDataJSON = JSON.parse(inputDataStringify);

        if (debug) {
            p("### inputData STRING ###");
            p(inputDataString);
            p("");

            p("### inputData ARRAY ###");
            p(inputDataArray);
            p("");

            p("### inputData CHECK JSON ###");
            p(inputDataCheckJSON);
            p("");

            p("### inputData STRINGIFY ###");
            p(inputDataStringify);
            p("");

            p("### inputData JSON ###");
            p(inputDataJSON);
            p("");
        }

        var putData = {
            object: [inputData]
        };

        var putDataString = putData.toString();
        var putDataArray = putDataString.split(',');
        var putDataCheckJSON = IsValidJson(putData);
        var putDataStringify = JSON.stringify(putData);
        var putDataJSON = JSON.parse(putDataStringify);

        if (debug) {
            p("### putData STRING ###");
            p(putDataString);
            p("");

            p("### putData ARRAY ###");
            p(putDataArray);
            p("");

            p("### putData CHECK JSON ###");
            p(putDataCheckJSON);
            p("");

            p("### putData STRINGIFY ###");
            p(putDataStringify);
            p("");

            p("### putData JSON ###");
            p(putDataJSON);
            p("");
        }

        collection.find(putData, {
            _id: 0
        }, function(err, result) {
            if (err) {
                p(err);
                p('### There was an error finding the document.');
                socket.emit('addedDocument'), {
                    'found': 'no',
                    'error': 'yes',
                    'errorType': 'find',
                    'added': 'no',
                    'errorMsg': err
                }
            } else {
                var resultString = result.toString();
                var resultArray = resultString.split(',');
                var resultJSON = IsValidJson(result);
                var resultStringify = JSON.stringify(result);

                if (debug) {
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

                if (result != "") {
                    p("### The document already exists.");
                    socket.emit('addedDocument', {
                        'found': 'yes',
                        'error': 'no',
                        'added': 'no',
                        'data': result,
                        'array': resultArray,
                        'string': resultString,
                        'csv': input
                    });
                } else {
                    collection.insert(putData, function(err, inserted) {
                        if (err) {
                            p(err);
                            p("### There was an error inserting the document.");
                            socket.emit('addedDocument', {
                                'found': 'no',
                                'error': 'yes',
                                'errorType': 'insert',
                                'added': 'no',
                                'errorMsg': err
                            });
                        } else {
                            p("### The document was successfully added.");
                            socket.emit('addedDocument', {
                                'found': 'no',
                                'error': 'no',
                                'added': 'yes',
                                'data': result,
                                'array': resultArray,
                                'string': resultString,
                                'csv': input
                            });
                        }
                    });
                }
            }
        });
        socket.emit('clientConnected', {
            'count': counter
        });
    });

    //Processing for read()
    socket.on('findDocument', function(input) {

        var inputString = input.toString();
        var inputArray = inputString.split(',');
        var inputCheckJSON = IsValidJson(input);
        var inputStringify = JSON.stringify(input);
        var inputJSON = JSON.parse(inputStringify);

        if (debug) {
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
        }

        // Check and see if there are any wildcards
        var isWildcard = false;
        for (var i = 0; i < inputArray.length; i++) {
            if (inputArray[i] === "?") {
                isWildcard = true;
            }
        }

        // If there is a wildcard, use elemMatch. If not, then use the object
        var query = {};
        var queryMatch = {};
        var readData;
        var regexp = /.*/i;

        if (!isWildcard) {
            for (var x = 0; x < inputArray.length; x++) {
                query['i' + x] = inputArray[x];
            }

            readData = {
                object: [query]
            };
        } else {
            for (var x = 0; x < inputArray.length; x++) {
                if (inputArray[x] === "?") {
                    queryMatch['i' + x] = regexp;
                } else {
                    queryMatch['i' + x] = inputArray[x];
                }
            }
            readData = {
                object: {
                    $elemMatch: queryMatch
                }
            };
        }

        // Debug
        if (!isWildcard) {
            var queryString = query.toString();
            var queryArray = queryString.split(',');
            var queryCheckJSON = IsValidJson(query);
            var queryStringify = JSON.stringify(query);
            var queryJSON = JSON.parse(queryStringify);

            if (debug) {
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
            }
        } else {
            var queryMatchString = queryMatch.toString();
            var queryMatchArray = queryMatchString.split(',');
            var queryMatchCheckJSON = IsValidJson(queryMatch);
            var queryMatchStringify = JSON.stringify(queryMatch);
            var queryMatchJSON = JSON.parse(queryMatchStringify);

            if (debug) {
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
            }
        }

        var readDataString = readData.toString();
        var readDataArray = readDataString.split(',');
        var readDataCheckJSON = IsValidJson(readData);
        var readDataStringify = JSON.stringify(readData);
        var readDataJSON = JSON.parse(readDataStringify);

        if (debug) {
            p("### readData STRING ###");
            p(readDataString);
            p("");

            p("### readData ARRAY ###");
            p(readDataArray);
            p("");

            p("### readData CHECK JSON ###");
            p(readDataCheckJSON);
            p("");

            p("### readData STRINGIFY ###");
            p(readDataStringify);
            p("");

            p("### readData JSON ###");
            p(readDataJSON);
            p("");
        }

        collection.find(readData, {
            _id: 0
        }, function(err, result) {
            if (err) {
                p(err);
                p("### There was an error finding the document.");
                socket.emit('foundDocument'), {
                    'found': 'no',
                    'error': 'yes',
                    'errorType': 'find',
                    'errorMsg': err
                }
            } else {
                var resultString = result.toString();
                var resultArray = resultString.split(',');
                var resultJSON = IsValidJson(result);
                var resultStringify = JSON.stringify(result);

                if (debug) {
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

                if (result != "") {
                    socket.emit('foundDocument', {
                        'found': 'yes',
                        'error': 'no',
                        'data': result,
                        'array': resultArray,
                        'string': resultString,
                        'csv': input
                    });
                } else {
                    socket.emit('foundDocument', {
                        'found': 'no',
                        'error': 'no'
                    })
                }
            }
        });
        socket.emit('clientConnected', {
            'count': counter
        });
    });


    //Processing for take()
    socket.on('takeDocument', function(input) {

        var inputString = input.toString();
        var inputArray = inputString.split(',');
        var inputCheckJSON = IsValidJson(input);
        var inputStringify = JSON.stringify(input);
        var inputJSON = JSON.parse(inputStringify);

        if (debug) {
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
        }

        // Check and see if there are any wildcards
        var isWildcard = false;
        for (var i = 0; i < inputArray.length; i++) {
            if (inputArray[i] === "?") {
                isWildcard = true;
            }
        }

        // If there is a wildcard, use elemMatch. If not, then use the object
        var query = {};
        var queryMatch = {};
        var takeData;
        var regexp = /.*/i;

        if (!isWildcard) {
            for (var x = 0; x < inputArray.length; x++) {
                query['i' + x] = inputArray[x];
            }

            takeData = {
                object: [query]
            };
        } else {
            for (var x = 0; x < inputArray.length; x++) {
                if (inputArray[x] === "?") {
                    queryMatch['i' + x] = regexp;
                } else {
                    queryMatch['i' + x] = inputArray[x];
                }
            }
            takeData = {
                object: {
                    $elemMatch: queryMatch
                }
            };
        }

        // Debug
        if (!isWildcard) {
            var queryString = query.toString();
            var queryArray = queryString.split(',');
            var queryCheckJSON = IsValidJson(query);
            var queryStringify = JSON.stringify(query);
            var queryJSON = JSON.parse(queryStringify);

            if (debug) {
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
            }
        } else {
            var queryMatchString = queryMatch.toString();
            var queryMatchArray = queryMatchString.split(',');
            var queryMatchCheckJSON = IsValidJson(queryMatch);
            var queryMatchStringify = JSON.stringify(queryMatch);
            var queryMatchJSON = JSON.parse(queryMatchStringify);

            if (debug) {
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
            }
        }

        var takeDataString = takeData.toString();
        var takeDataArray = takeDataString.split(',');
        var takeDataCheckJSON = IsValidJson(takeData);
        var takeDataStringify = JSON.stringify(takeData);
        var takeDataJSON = JSON.parse(takeDataStringify);

        if (debug) {
            p("### takeData STRING ###");
            p(takeDataString);
            p("");

            p("### takeData ARRAY ###");
            p(takeDataArray);
            p("");

            p("### takeData CHECK JSON ###");
            p(takeDataCheckJSON);
            p("");

            p("### takeData STRINGIFY ###");
            p(takeDataStringify);
            p("");

            p("### takeData JSON ###");
            p(takeDataJSON);
            p("");
        }

        collection.find(takeData, {
            _id: 0
        }, function(err, result) {
            if (err) {
                p(err);
                p("### There was an error finding the document.");
                socket.emit('tookDocument'), {
                    'found': 'no',
                    'error': 'yes',
                    'errorType': 'find',
                    'errorMsg': err
                }
            } else {
                var resultString = result.toString();
                var resultArray = resultString.split(',');
                var resultJSON = IsValidJson(result);
                var resultStringify = JSON.stringify(result);

                if (debug) {
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

                if (result != "") {
                    p("### The document was found.");
                    socket.emit('tookDocument', {
                        'found': 'yes',
                        'error': 'no',
                        'data': result,
                        'array': resultArray,
                        'string': resultString,
                        'csv': input
                    });
                    collection.remove(takeData, {
                        _id: 0
                    }, function(err, res) {
                        if (err) {
                            p(err);
                            p("### There was an error removing the document.");
                            socket.emit('tookDocument'), {
                                'found': 'no',
                                'error': 'yes',
                                'errorType': 'remove',
                                'errorMsg': err
                            }
                        } else {
                            p("### The document has been removed.");
                        }
                    });
                } else {
                    p("### The document was not found.");
                    socket.emit('tookDocument', {
                        'found': 'no',
                        'error': 'no'
                    })
                }
            }
        });
        socket.emit('clientConnected', {
            'count': counter
        });
    });

    socket.on('dropSpace', function() {
        p("dropping the space");
        collection.drop();
        socket.emit('spaceDropped', {
            'isDropped': 'yes'
        });
        socket.emit('clientConnected', {
            'count': counter
        });
    });

    socket.on('disconnect', function() {
        counter--;
        p("### Total client connection: " + counter);
        socket.emit('clientConnected', {
            'count': counter
        });
    });
});
