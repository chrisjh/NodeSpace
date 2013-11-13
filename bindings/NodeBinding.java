//package javaBinding;

import java.awt.AWTException;
import java.awt.Robot;
import java.net.MalformedURLException;

import io.socket.*;
import org.java_websocket.*;
import org.json.*;

public class NodeBinding {

	/**
	 * @param args
	 * @throws MalformedURLException 
	 * @throws AWTException 
	 */
	
	public static void main(String[] args) throws MalformedURLException, AWTException {
		
		String IP_ADDRESS = "152.23.53.63"; //Just change these values to match what IP your app is running on.
		String PORT_NUMBER = "8888"; //Change this port number to the port number your app is using.
		
		//DO NOT MODIFY THIS LINE
		String SOCKET_ADDRESS_FULL = "http://".concat(IP_ADDRESS).concat(":").concat(PORT_NUMBER);
		
		SocketIO socket = new SocketIO(SOCKET_ADDRESS_FULL);
        socket.connect(new IOCallback() {

        	public void onMessage(JSONObject json, IOAcknowledge ack) {
                try {
                    System.out.println("Server said:" + json.toString(2));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            public void onMessage(String data, IOAcknowledge ack) {
                System.out.println("Server said: " + data);
            }

            public void onError(SocketIOException socketIOException) {
                System.out.println("an Error occured");
                socketIOException.printStackTrace();
            }

            public void onDisconnect() {
                System.out.println("Connection terminated.");
            }

            public void onConnect() {
                System.out.println("Connection established");
            }

            public void on(String event, IOAcknowledge ack, Object... args) {
            	if(event.equals("foundDocument")){
            		System.out.println(event);
            		processData(args);
            	}
            	if(event.equals("pageview")){
            		System.out.println("Test!");
            	}
            }
        });
        
        
        socket.disconnect();
	}
	
	//Copy and paste these functions into your Java program
	
	private static void put(String data, SocketIO socket){
		socket.emit("addDocument", data);
	}
	
	private static void read(String data, SocketIO socket){
		socket.emit("findDocument", data);
	}
	
	private static void take(String data, SocketIO socket){
		socket.emit("takeDocument", data);
	}
	
	private static void processData(Object... args){
		System.out.println(args);
	}
	
	public static void putTest(SocketIO socket){
		//----
		try{
			put("hello,from,java",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
		//----
		try{
			put("this,is,from,james,martin",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
		//----
		try{
			put("foo,bar",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
	}
	
	public static void readTest(SocketIO socket){
		//----
		try{
			read("hello,from,java",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
		//----
		try{
			read("this,is,from,james,martin",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
		//----
		try{
			read("foo,bar",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
	}
	
	public static void takeTest(SocketIO socket){
		//----
		try{
			take("hello,from,java",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
		//----
		try{
			take("this,is,from,james,martin",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
		//----
		try{
			take("foo,bar",socket);
		}catch(Exception e){
			System.out.println("Error");
			e.printStackTrace();
		}
	}

}