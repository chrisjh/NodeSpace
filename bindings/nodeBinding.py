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

from socketIO_client import SocketIO
import json
import time

#Needs to be declared and set in client code
SOCKET_IO_HOST = 'localhost'
SOCKET_IO_PORT = 8888
socketIO = SocketIO(SOCKET_IO_HOST,SOCKET_IO_PORT)
mostRecentTuple = ''


#Need to parse JSON object to be readable by any language
def processTuple(*args):
	print "Tuple read from space: "
	print args

#Method to encode a Python object to JSON to be used as the argument of put(tuple)
def encode(o):
	return JSONEncoder().encode(o)

#Put function
def put(tuple):
	print "Adding: "+tuple
	socketIO.emit('addDocument', tuple)

#Read function
def read(key):
	#try:
	socketIO.on('foundDocument',processTuple)
	socketIO.emit('findDocument', key)
	socketIO.wait_for_callbacks(seconds=3)
	#except:
		#print "Error or timeout"
		
#Get/take function
def take(key):
	socketIO.on('foundDocument',on_server_reply)
	socketIO.emit('takeDocument', key)
	socketIO.wait_for_callbacks(second=3)

#
# --- TESTING PUT ---
#

def putTest():
	tupleOne = "hello,from,python"
	tupleTwo = "foo"
	#tupleThree = "bar,baz,boom"
	emptyTuple = ""
	try:
		put(tupleOne)
		put(tupleTwo)
		put("bar,baz,boom")
		put(emptyTuple)
		put("")
	except:
		print "An add failed or a timeout occurred"

#
# --- TESTING READ ---
#

def readTest():
	try:
		read("hello,from,js")
		read("hello,from,python")
		read("hello")
		read("")
	except:
		print "A read failed or a timeout occurred"

# 
# --- MAIN THREAD --- 
# 

print "Connecting..."
#putTest()
readTest()
print "Test complete."