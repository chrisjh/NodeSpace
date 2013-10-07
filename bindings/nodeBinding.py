#https://github.com/invisibleroads/socketIO-client
#Must install socketIO-client with pip first
from socketIO_client import SocketIO
import json

#Needs to be set in client code
serverAddress = 'localhost'
port = 8888

#Test function that simply connects to the server.
#You can see if the connection works, the heartbeat of the server will reflect an increase in connection
def emit():
	with SocketIO(serverAddress,port) as socketIO:
		socketIO.emit('aaa')
		socketIO.wait(seconds=1)

#Method to encode a Python object to JSON to be used as the argument of put(tuple)
def encode(o):
	return JSONEncoder().encode(o)

#Put function
def put(tuple):
	print tuple
	with SocketIO(serverAddress,port) as socketIO:
		socketIO.emit('addDocument', tuple)

#Read function
def read(key):
	with SocketIO(serverAddress,port) as socketIO:
		socketIO.emit('findDocument', key)
		#Need to wait for server response?

#Get/take function
#def get(key):

#####################################################################
#TEST

print "Connecting..."
tuple = {'a':1}
try:
	put(tuple)
	print "Add successful."
except:
	print "Add failed."