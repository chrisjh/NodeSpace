import java.net.MalformedURLException;

import io.socket.*;
import org.java_websocket.*;
import org.json.*;

public class nodeBinding {

	/**
	 * @param args
	 * @throws MalformedURLException 
	 */
	public static void main(String[] args) throws MalformedURLException {
		
		SocketIO socket = new SocketIO("http://192.168.0.2:8888");
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
                System.out.println("Server triggered event '" + event + "'");
            }
        });

        // This line is cached until the connection is establisched.
        socket.send("Hello Server!");
	}
	
	

}
