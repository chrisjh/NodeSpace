#https://github.com/invisibleroads/socketIO-client
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
	with SocketIO(serverAddress,port) as socketIO:
		socketIO.emit('addDocument', tuple)

#Read function
def read(key):
	with SocketIO(serverAddress,port) as socketIO:
		socketIO.emit('findDocument', key)
		#Need to wait for server response?

#Get/take function
#def get(key):

print "Connecting"
tuple = {'a':1}
put(tuple)

