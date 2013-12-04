# https://github.com/invisibleroads/socketIO-client
#
# ---   First time user?   ---
#
# First, install socketIO-client with pip
# 
# The command in Unix based systems is:
# `pip install -U socketIO-client`
# `pip install simplejson`
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
	return json.dumps(o)

#Put function
def put(tuple):
	print "Adding: "+tuple
	#print tuple
	socketIO.emit('addDocument', tuple)

#Read function
def read(key):
	#try:
	socketIO.on('foundDocument',processTuple)
	socketIO.emit('findDocument', key)
	socketIO.wait(seconds=1)
	#except:
		#print "Error or timeout"
		
#Get/take function
def take(key):
	socketIO.on('foundDocument',processTuple)
	socketIO.emit('takeDocument', key)
	socketIO.wait(second=1)

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
		put("hello,from,java")
		put("hello,from,js")
	except:
		print "An add failed or a timeout occurred"

#
# --- TESTING READ ---
#

def readTest():
	try:
		read("hello,from,js")
	except:
		print "A read failed or a timeout occurred"
	try:
		read("hello,from,java")
	except:
		print "A read failed or a timeout occurred"
	try:
		read("hello,from,python")
	except:
		print "A read failed or a timeout occurred"

# 
# --- MAIN THREAD --- 
# 

print "Connecting..."
#putTest()
put("hello,from,python")
time.sleep(3)
print 'Adding duplicate'
put("hello,from,python")
