/*
    Version 0.0.3
 */
var socket = io.connect('http://localhost:8888/', {
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 5
});

/*
	Version 0.0.2 Test
 */
/*var socket = io.connect('http://localhost:8888/');

socket.on('connect', function(data) {
    setStatus('connected');
    socket.emit('subscribe', {
        channel: 'realtime'
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
}*/

/*
	Version 0.0.1 Test
 */
/*var socket = io.connect('http://localhost');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });*/
