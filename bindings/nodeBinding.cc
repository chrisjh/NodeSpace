#include <iostream>
/*
	Need to include Boost, Websocket++, Rapidjson, and socket_io_handler.cpp
 */

using namespace NodeSpace;

int main ()
{
	cout<<"Hello World!"<<endl;

	/*
		Snippet from Socket.io Client++ 
		https://github.com/ebshimizu/socket.io-clientpp
	 */
	socketio_client_handler_ptr handler(new socketio_client_handler());
	client endpoint(handler);
	client::connection_ptr con = endpoint.get_connection(handler->perform_handshake("ws://localhost:8080"));
}