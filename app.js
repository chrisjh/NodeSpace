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
var testdb = require('./db');

//Setup Express and MongoDB
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

// Start server
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

// Socket interactions
var debug = false;
var connectedCount = 0;

/**
 * Shorthand function for console.log
 * @param  Any e [Takes all variables]
 */

function p(e) {
    console.log(e);
}

/** 
 * Emits a socket message to update clients on how many total clients are connected
 * @param int counter [Number of total connected clients]
 */

function EmitClientConnected(counter) {
    io.sockets.emit('clientConnected', {
        'count': counter
    });
}

/** 
 * Main socket function - enables all possible messages when client connects
 * @param  var socket [callback]
 */
io.sockets.on('connection', function(socket) {

    connectedCount++;
    p('### Total connected clients: ' + connectedCount);
    EmitClientConnected(connectedCount);

    /**
     * Put(T) function
     * @param  var input [callback]
     * @return [emits message]
     */
    socket.on('addDocument', function(input) {

        var inputString = input.toString();
        var inputArray = inputString.split(',');

        if (debug) {
            p('### inputString ###');
            p(inputString);
            p('');

            p('### inputArray ###');
            p(inputArray);
            p('');
        }

        var inputData = {};

        for (var x = 0; x < inputArray.length; x++) {
            inputData['i' + x] = inputArray[x];
        }

        var inputDataString = inputData.toString();
        var inputDataArray = inputDataString.split(',');

        if (debug) {
            p('### inputDataString ###');
            p(inputDataString);
            p('');

            p('### inputDataArray ###');
            p(inputDataArray);
            p('');
        }

        var putData = {
            object: [inputData]
        };

        var putDataString = putData.toString();
        var putDataArray = putDataString.split(',');

        if (debug) {
            p('### putDataString ###');
            p(putDataString);
            p('');

            p('### putDataArray ###');
            p(putDataArray);
            p('');
        }

        collection.find(putData, {
            _id: 0
        }, function(err, result) {
            if (err) {
                p(err);
                p('### There was an error finding the document.');
                socket.emit('addedDocument', {
                    'found': 'no',
                    'error': 'yes',
                    'errorType': 'find',
                    'added': 'no',
                    'errorMsg': err
                });
            } else {
                var resultString = result.toString();
                var resultArray = resultString.split(',');

                if (debug) {
                    p('### resultString ###');
                    p(resultString);
                    p('');

                    p('### resultArray ###');
                    p(resultArray);
                    p('');
                }

                if (result != '') {
                    p('### The document already exists.');
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
                            p('### There was an error inserting the document.');
                            socket.emit('addedDocument', {
                                'found': 'no',
                                'error': 'yes',
                                'errorType': 'insert',
                                'added': 'no',
                                'errorMsg': err
                            });
                        } else {
                            p('### The document was successfully added.');
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
    });

    /**
     * Read(T) function
     * @param  var input [callback]
     * @return [emits message]
     */
    socket.on('findDocument', function(input) {

        var inputString = input.toString();
        var inputArray = inputString.split(',');

        if (debug) {
            p('### INPUTString ###');
            p(inputString);
            p('');

            p('### INPUTArray ###');
            p(inputArray);
            p('');
        }

        // Check and see if there are any wildcards
        var isWildcard = false;
        for (var i = 0; i < inputArray.length; i++) {
            if (inputArray[i] === '?') {
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
                if (inputArray[x] === '?') {
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

        // Debug for queries
        if (!isWildcard) {
            var queryString = query.toString();
            var queryArray = queryString.split(',');

            if (debug) {
                p('### queryString ###');
                p(queryString);
                p('');

                p('### queryArray ###');
                p(queryArray);
                p('');
            }
        } else {
            var queryMatchString = queryMatch.toString();
            var queryMatchArray = queryMatchString.split(',');

            if (debug) {
                p('### queryMatchString ###');
                p(queryMatchString);
                p('');

                p('### queryMatchArray ###');
                p(queryMatchArray);
                p('');
            }
        }

        var readDataString = readData.toString();
        var readDataArray = readDataString.split(',');

        if (debug) {
            p('### readDataString ###');
            p(readDataString);
            p('');

            p('### readDataArray ###');
            p(readDataArray);
            p('');
        }

        collection.find(readData, {
            _id: 0
        }, function(err, result) {
            if (err) {
                p(err);
                p('### There was an error finding the document.');
                socket.emit('foundDocument', {
                    'found': 'no',
                    'error': 'yes',
                    'errorType': 'find',
                    'errorMsg': err
                });

            } else {
                var resultString = result.toString();
                var resultArray = resultString.split(',');

                if (debug) {
                    p('### resultString ###');
                    p(resultString);
                    p('');

                    p('### resultArray ###');
                    p(resultArray);
                    p('');
                }

                if (result != '') {
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
                    });

                }
            }
        });
    });


    /**
     * Take(T) function
     * @param  var input [callback]
     * @return [emits message]
     */
    socket.on('takeDocument', function(input) {

        var inputString = input.toString();
        var inputArray = inputString.split(',');

        if (debug) {
            p('### INPUTString ###');
            p(inputString);
            p('');

            p('### INPUTArray ###');
            p(inputArray);
            p('');
        }

        // Check and see if there are any wildcards
        var isWildcard = false;
        for (var i = 0; i < inputArray.length; i++) {
            if (inputArray[i] === '?') {
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
                if (inputArray[x] === '?') {
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

        // Debug for queries
        if (!isWildcard) {
            var queryString = query.toString();
            var queryArray = queryString.split(',');

            if (debug) {
                p('### queryString ###');
                p(queryString);
                p('');

                p('### queryArray ###');
                p(queryArray);
                p('');
            }
        } else {
            var queryMatchString = queryMatch.toString();
            var queryMatchArray = queryMatchString.split(',');

            if (debug) {
                p('### queryMatchString ###');
                p(queryMatchString);
                p('');

                p('### queryMatchArray ###');
                p(queryMatchArray);
                p('');
            }
        }

        var takeDataString = takeData.toString();
        var takeDataArray = takeDataString.split(',');

        if (debug) {
            p('### takeDataString ###');
            p(takeDataString);
            p('');

            p('### takeDataArray ###');
            p(takeDataArray);
            p('');
        }

        collection.find(takeData, {
            _id: 0
        }, function(err, result) {
            if (err) {
                p(err);
                p('### There was an error finding the document.');
                socket.emit('tookDocument'), {
                    'found': 'no',
                    'error': 'yes',
                    'errorType': 'find',
                    'errorMsg': err
                }
            } else {
                var resultString = result.toString();
                var resultArray = resultString.split(',');

                if (debug) {
                    p('### resultString ###');
                    p(resultString);
                    p('');

                    p('### resultArray ###');
                    p(resultArray);
                    p('');
                }

                if (result != '') {
                    p('### The document was found.');
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
                            p('### There was an error removing the document.');
                            socket.emit('tookDocument'), {
                                'found': 'no',
                                'error': 'yes',
                                'errorType': 'remove',
                                'errorMsg': err
                            }
                        } else {
                            p('### The document has been removed.');
                        }
                    });
                } else {
                    p('### The document was not found.');
                    socket.emit('tookDocument', {
                        'found': 'no',
                        'error': 'no'
                    });

                }
            }
        });
    });

    /**
     * Drops all curent data in the NodeSpace
     * @return [emits message]
     */
    socket.on('dropSpace', function() {
        p('### The NodeSpace has been dropped.');
        collection.drop();
        socket.emit('spaceDropped', {
            'isDropped': 'yes'
        });
    });

    /**
     * Populates NodeSpace with test data from db.js
     * @return [emits message]
     */
    socket.on('fillSpace', function() {

        testdb.data.forEach(function(obj) {
            collection.find(obj, {
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

                    if (debug) {
                        p('### resultString ###');
                        p(resultString);
                        p('');

                        p('### resultArray ###');
                        p(resultArray);
                        p('');
                    }

                    if (result != '') {
                        p('### The document already exists.');
                        socket.emit('addedDocument', {
                            'found': 'yes',
                            'error': 'no',
                            'added': 'no',
                            'data': result,
                            'array': resultArray,
                            'string': resultString
                        });
                    } else {
                        collection.insert(obj, function(err, inserted) {
                            if (err) {
                                p(err);
                                p('### There was an error inserting the document.');
                                socket.emit('addedDocument', {
                                    'found': 'no',
                                    'error': 'yes',
                                    'errorType': 'insert',
                                    'added': 'no',
                                    'errorMsg': err
                                });
                            } else {
                                p('### The document was successfully added.');
                                p('### The NodeSpace has been populated.');
                                socket.emit('spaceFilled', {
                                    'isFilled': 'yes'
                                });

                            }
                        });
                    }
                }
            });
        });
    });

    /**
     *  Relieves client from connection
     * @return [emits message]
     */
    socket.on('disconnect', function() {
        connectedCount--;
        p('### Total client connection: ' + connectedCount);
        EmitClientConnected(connectedCount);
    });
});
