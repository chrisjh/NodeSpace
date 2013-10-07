#https://github.com/invisibleroads/socketIO-client
from socketIO_client import SocketIO
import json

serverAddress = 'localhost'
port = 8888

def emit():
	with SocketIO(serverAddress,port) as socketIO:
		socketIO.emit('aaa')
		socketIO.wait(seconds=1)

def encode(o):
	return JSONEncoder().encode(o)

def put(tuple):
	with SocketIO(serverAddress,port) as socketIO:
		socketIO.emit('addDocument', tuple)

def read(key):
	print key

#def get(key):

print "Connecting"
tuple = {'a':1}
put(tuple)

