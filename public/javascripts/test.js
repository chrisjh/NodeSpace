/*
    Version 0.1.1
 */
var socket = io.connect('http://localhost:8888/', {
    'reconnect': true,
    'reconnection delay': 1000,
    'max reconnection attempts': 5
});

socket.on('connect', function(data) {
    setStatus('connected');

    socket.on('clientConnected', function(result) {
        $('#connections').html(result.count);
    });

    $('#put').click(function() {
        var input = $('#putInput').val();
        socket.emit('addDocument', input);
    });

    socket.on('addedDocument', function(result) {

        var resultStringify = JSON.stringify(result.data);

        if (result.found == 'yes' && result.added == 'no') {
            $(".warn").show();
            $('#notifywarn').html("Put(T) Warning: Document already exists");
            $(".warn").fadeOut(5000);
            console.log('### Put(T) Warning: Document aleady exists');
            console.log(result);
            $('#status').html("Status: Document already exists in NodeSpace.")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        } else if (result.found == 'no' && result.added == 'yes') {
            $(".success").show();
            $('#notifysuccess').html("Put(T) Successful");
            $(".success").fadeOut(5000);
            console.log('### Put(T) Successful: Document inserted');
            console.log(result);
            $('#status').html("Status: Document inserted into NodeSpace")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        } else if (result.found == 'no' && result.added == 'no') {
            $(".error").show();
            $('#notifyerror').html("Put(T) Error: Document insert failed");
            $(".error").fadeOut(5000);
            console.log('### Put(T) Warning: Document insert failed');
            console.log(result);
            $('#status').html("Status: Document failed to be inserted into NodeSpace.")
            $('#added').html("Added? " + result.added);
            if (result.error == 'yes') {
                $('#errorType').html("Error on " + result.errorType);
                $('#errorMsg').html(result.errorMsg);
            }
        }
    });

    $('#read').click(function() {
        var input = $('#readInput').val();
        socket.emit('findDocument', input);
    });

    socket.on('foundDocument', function(result) {

        var resultStringify = JSON.stringify(result.data);

        if (result.found == 'yes') {
            $(".success").show();
            $('#notifysuccess').html("Read(T) Successful");
            $(".success").fadeOut(5000);
            console.log('### Read(T) Successful: Document found');
            console.log(result);
            $('#status').html("Status: Document found in NodeSpace")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        } else if (result.found == 'no') {
            $(".error").show();
            $('#notifyerror').html("Read(T) Error: Document not found");
            $(".error").fadeOut(5000);
            console.log('### Read(T) Error: Document not found');
            console.log(result);
            $('#status').html("Status: Document not found in NodeSpace.")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
            if (result.error == 'yes') {
                $('#errorType').html("Error on " + result.errorType);
                $('#errorMsg').html(result.errorMsg);
            }
        }
    });

    $('#take').click(function() {
        var input = $('#takeInput').val();
        socket.emit('takeDocument', input);
    });

    socket.on('tookDocument', function(result) {

        var resultStringify = JSON.stringify(result.data);

        if (result.found == 'yes') {
            $(".success").show();
            $('#notifysuccess').html("Take(T) Successful");
            $(".success").fadeOut(5000);
            console.log('### Take(T) Successful: Document found and removed');
            console.log(result);
            $('#status').html("Status: Document found and removed from NodeSpace")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        } else if (result.found == 'no') {
            $(".error").show();
            $('#notifyerror').html("Take(T) Error: Document not found");
            $(".error").fadeOut(5000);
            console.log('### Take(T) Error: Document not found');
            console.log(result);
            $('#status').html("Status: Document not found in NodeSpace.")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
            if (result.error == 'yes') {
                $('#errorType').html("Error on " + result.errorType);
                $('#errorMsg').html(result.errorMsg);
            }
        }
    });

    $('#drop').click(function() {
        socket.emit('dropSpace');
    });

    socket.on('spaceDropped', function(data) {
        console.log(data.isDropped);
        if (data.isDropped == 'yes') {
            $(".success").show();
            $('#notifysuccess').html("NodeSpace Dropped Successfully");
            $(".success").fadeOut(5000);
            console.log('Space dropped');
            $('#foundTuple').html("Found tuple?");
            $('#returnedTuple').html("None");
        }
    });

    $('#prettify').click(function() {
        var text = $('#returnedJSON').text();
        var json = JSON.parse(text);
        var prettyJSON = JSON.stringify(json, null, 2);
        $('#returnedJSON').html(prettyJSON);
        console.log(prettyJSON);
    });

});

socket.on('reconnecting', function(data) {
    setStatus('reconnecting');
});

function setStatus(msg) {
    console.log('Connection Status : ' + msg);
}