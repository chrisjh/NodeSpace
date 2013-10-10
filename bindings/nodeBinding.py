# https://github.com/invisibleroads/socketIO-client
#
# ---   First time user?   ---
#
# First, install socketIO-client with pip
# 
# The command in Unix based systems is:
# `pip install -U socketIO-client`
#
# ---   Using this binding for one of your programs?   ---   
#
# Simply copy the code up until the line of hashes and paste it into your script.
# Next, set the `SOCKET_IO_HOST` and `SOCKET_IO_PORT` values to the IP address and port number of the server your NodeSpace is running on
# 

from socketIO_client import SocketIO
import json

#Needs to be declared and set in client code
SOCKET_IO_HOST = 'localhost'
SOCKET_IO_PORT = 8888
socketIO = SocketIO(SOCKET_IO_HOST,SOCKET_IO_PORT)
mostRecentTuple = ''

def on_server_reply(*args):
	print 'on_server_reply', args

def emit():
	socketIO.emit('aaa')
	socketIO.wait(seconds=1)

#Method to encode a Python object to JSON to be used as the argument of put(tuple)
def encode(o):
	return JSONEncoder().encode(o)

#Put function
def put(tuple):
	print tuple
	socketIO.emit('addDocument', tuple)

#Read function
def read(key):
	socketIO.emit('findDocument', key)
	socketIO.on('foundDoc',on_server_reply)
	#TODO:
	#NEED TO FIX THIS WAITING TIME -- can probably do it without waiting...
	#Need to keep function running until server reply is processed
	socketIO.wait(seconds=1)
		
#Get/take function
#def take(key):

# 
# ---   TEST   --- 
# 

print "Connecting..."
tuple = {'a': 'hello'}
tup = 'hello'
try:
	put(tuple)
	print "Add successful."
except:
	print "Add failed."
try:
	read(tup)
	print "Read successful."
	#print mostRecentTuple
except:
	print "Read failed."