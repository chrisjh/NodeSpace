/*
    Version 0.0.4
 */
var socket = io.connect('http://localhost:8888/', {
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 5
});

var pages = {};
var lastPageId = 0;

function GetInfo() {
    socket.emit('GetSession', '');
    // The client is now initiating the request we setup earlier to get its socket.id from the server.
}

socket.on('SessionID', function(msg) {
    socket.emit('SendMessage', msg + ' Has Connected');
    // When the server returns the socket.id the client will emit a message to the server for anyone
    //  else who is subscribed to the "message" channel. My terminology for these explanations is not
    //   accurate but I think that this way of stating things is a lot easier to wrap your head around...
});

socket.on('connect', function(data) {
    setStatus('connected');

    socket.on('pageview', function(msg) {
        $('#connections').html(msg.connections);
        if (msg.url) {
            if ($('#visits tr').length > 10) {
                $('#visits tr:last').remove();
            }
            $('#visits tbody').prepend('<tr><td>' + msg.url + '</td><td>' + msg.ip + '</td><td>' + msg.timestamp + '</td></tr>');

            if (pages[msg.url]) {
                pages[msg.url].views = pages[msg.url].views + 1;
                $('#page' + pages[msg.url].pageId).html(pages[msg.url].views);
            } else {
                pages[msg.url] = {
                    views: 1,
                    pageId: ++lastPageId
                };
                $('#pageViews tbody').append('<tr><td>' + msg.url + '</td><td id="page' + lastPageId + '">1</td></tr>');
            }

        }
    });

    $('#put').click(function() {
        console.log('Putting tuple in the space...')

        var tuple = $('#putInput').val();

        var document = {
            'tuple': tuple
        }

        console.log('Adding document...');

        socket.emit('addDocument', document);
    });

    $('#read').click(function(){
        var query = $('#readTuple').val();

        var document = {
            'tuple': query
        }

        console.log('Trying to find tuple...');

        socket.emit('findDocument', document);
    });

    socket.on('foundDoc', function(data){
        console.log('Found tuple!');
        console.log(data);
        $('#foundTuples').html(data.foundTuple);
        $('#returnedTuples').html(data.tupleIs);
    });
});

socket.on('reconnecting', function(data) {
    setStatus('reconnecting');
});

socket.on('message', function(data) {
    console.log('received a message: ', data);
    addMessage(data);
});

function addMessage(data) {
    $('#online').html(data);
}

function setStatus(msg) {
    console.log('Connection Status : ' + msg);
}
