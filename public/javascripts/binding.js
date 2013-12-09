/**
 * Establishes socket connection with server
 */
var socket = io.connect('http://localhost:8888/', {
    'reconnect': true,
    'reconnection delay': 1000,
    'max reconnection attempts': 5
});

/**
 * Main socket function - enables all possible messages once connected to the server
 * @param  var data [callback]
 */
socket.on('connect', function(data) {
    setStatus('connected');

    /**
     * Updates number of concurrently connected clients
     * @param  var result [callback]
     */
    socket.on('clientConnected', function(result) {
        $('#connections').html(result.count);
    });

    /**
     * Sends Put(T) function's input data to the space
     * @return [emits message]
     */
    $('#put').click(function() {
        var input = $('#putInput').val();
        socket.emit('addDocument', input);
    });

    /**
     * Response to Put(T) - Updates UI to reflect action
     * @param  var result [callback]
     */
    socket.on('addedDocument', function(result) {

        var resultStringify = JSON.stringify(result.data);

        if (result.found === 'yes' && result.added === 'no') {
            $(".warn").show();
            $('#notifywarn').html("Put(T) Warning: Document already exists");
            $(".warn").fadeOut(5000);
            console.log('### Put(T) Warning: Document aleady exists');
            console.log(result);
            $('#status').html("Status: Document already exists in NodeSpace.")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        } else if (result.found === 'no' && result.added === 'yes') {
            $(".success").show();
            $('#notifysuccess').html("Put(T) Successful");
            $(".success").fadeOut(5000);
            console.log('### Put(T) Successful: Document inserted');
            console.log(result);
            $('#status').html("Status: Document inserted into NodeSpace")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        } else if (result.found === 'no' && result.added === 'no') {
            $(".error").show();
            $('#notifyerror').html("Put(T) Error: Document insert failed");
            $(".error").fadeOut(5000);
            console.log('### Put(T) Warning: Document insert failed');
            console.log(result);
            $('#status').html("Status: Document failed to be inserted into NodeSpace.")
            $('#added').html("Added? " + result.added);
            if (result.error === 'yes') {
                $('#errorType').html("Error on " + result.errorType);
                $('#errorMsg').html(result.errorMsg);
            }
        }
    });

    /**
     * Sends Read(T) function's input data to the space
     * @return [emits message]
     */
    $('#read').click(function() {
        var input = $('#readInput').val();
        socket.emit('findDocument', input);
    });

    /**
     * Response to Read(T) - Updates UI to reflect action
     * @param  var result [callback]
     */
    socket.on('foundDocument', function(result) {

        var resultStringify = JSON.stringify(result.data);

        if (result.found === 'yes') {
            $(".success").show();
            $('#notifysuccess').html("Read(T) Successful");
            $(".success").fadeOut(5000);
            console.log('### Read(T) Successful: Document found');
            console.log(result);
            $('#status').html("Status: Document found in NodeSpace")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        } else if (result.found === 'no') {
            $(".error").show();
            $('#notifyerror').html("Read(T) Error: Document not found");
            $(".error").fadeOut(5000);
            console.log('### Read(T) Error: Document not found');
            console.log(result);
            $('#status').html("Status: Document not found in NodeSpace.")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
            if (result.error === 'yes') {
                $('#errorType').html("Error on " + result.errorType);
                $('#errorMsg').html(result.errorMsg);
            }
        }
    });

    /**
     * Sends Take(T) function's input data to the space
     * @return [emits message]
     */
    $('#take').click(function() {
        var input = $('#takeInput').val();
        socket.emit('takeDocument', input);
    });

    /**
     * Response to Take(T) - Updates UI to reflect action
     * @param  var result [callback]
     */
    socket.on('tookDocument', function(result) {

        var resultStringify = JSON.stringify(result.data);

        if (result.found === 'yes') {
            $(".success").show();
            $('#notifysuccess').html("Take(T) Successful");
            $(".success").fadeOut(5000);
            console.log('### Take(T) Successful: Document found and removed');
            console.log(result);
            $('#status').html("Status: Document found and removed from NodeSpace")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        } else if (result.found === 'no') {
            $(".error").show();
            $('#notifyerror').html("Take(T) Error: Document not found");
            $(".error").fadeOut(5000);
            console.log('### Take(T) Error: Document not found');
            console.log(result);
            $('#status').html("Status: Document not found in NodeSpace.")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
            if (result.error === 'yes') {
                $('#errorType').html("Error on " + result.errorType);
                $('#errorMsg').html(result.errorMsg);
            }
        }
    });

    /**
     * Sends command to drop the space
     * @return [emits message]
     */
    $('#drop').click(function() {
        socket.emit('dropSpace');
    });

    /**
     * Response to drop() - Updates UI to reflect action
     * @param  var data [callback]
     */
    socket.on('spaceDropped', function(data) {
        console.log(data.isDropped);
        if (data.isDropped === 'yes') {
            $(".success").show();
            $('#notifysuccess').html("NodeSpace Dropped Successfully");
            $(".success").fadeOut(5000);
            console.log('### NodeSpace dropped successfully');
            $('#status').html("Status: NodeSpace has been dropped.")
            $('#returnedJSON').html(resultStringify);
            $('#returnedCSV').html(result.csv);
        }
    });

    /**
     * Sends command to populate the space
     * @return [emits message]
     */
    $('#fill').click(function() {
        socket.emit('fillSpace');
    });

    /**
     * Response to populating the space - Updates UI to reflect action
     * @param  var data [callback]
     */
    socket.on('spaceFilled', function(data) {
        console.log(data.isFilled);
        if (data.isFilled === 'yes') {
            $(".success").show();
            $('#notifysuccess').html("NodeSpace Populated Successfully");
            $(".success").fadeOut(5000);
            console.log('### NodeSpace Populated successfully');
            $('#status').html("Status: NodeSpace has been populated.")
        }
    });

    /**
     * Parses the raw JSON to a more human readable format
     */
    $('#prettify').click(function() {
        var text = $('#returnedJSON').text();
        var json = JSON.parse(text);
        var prettyJSON = JSON.stringify(json, null, 2);
        $('#returnedJSON').html(prettyJSON);
        console.log(prettyJSON);
    });

});

/**
 * Sets status when connection to the server is lost
 * @param  var data [callback]
 */
socket.on('reconnecting', function(data) {
    setStatus('reconnecting');
});

/**
 * Modifies status in browser console
 * @param String msg
 */

function setStatus(msg) {
    console.log('Connection Status : ' + msg);
}
