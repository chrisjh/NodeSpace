#https://github.com/invisibleroads/socketIO-client
from socketIO_client import SocketIO

with SocketIO('localhost', 8888) as socketIO:
    socketIO.emit('aaa')
    socketIO.wait(seconds=1)