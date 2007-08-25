<?php
/* =======================================================================================================================
   response.php - handle all request/response traffic from the clients
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
   
   this page accepts requests from jax.js in order to setup an ajax connection between two browsers and share data.
   see 'docs/api.txt' for a detailed break down of how to use jax and a list of input/outputs of this script
*//*
   TODO:_
	+ purge the database of unused entries when it grows above specified size (64Kb?)
	+ impose a 4kb (configurable) limit on each incoming message
	+ thorough error handling and validation
	+ try to prevent request abuse / hijacking others connections / XSS &c.
*/
//do all the common startup
require_once "startup.php";

//prepare the message to return
$output = array ();

switch ($request_type) {
	case "jax_open":  //=================================================================================================
		//create an open slot for the new user. a connection id is generated, and the other person can join with this
		$user_id = registerSession ();
		$conn_id = getConnectionID ();
		$context = request ('context');
		
		//save this to the database
		$sql = "INSERT INTO connections (connid, context, userid1) VALUES ('$conn_id', '$context', '$user_id');";
		$database->query ($sql) or die (json_encode(array(
			'result' => 'false',
			'error'  => "SQL error creating a jax connection: ".$database->error
		)));
		
		//the request also has the option of providing some json data for the other person when they connect
		if (isset ($_REQUEST['data'])) {
			addToQueue ($conn_id, 'AWAITING', 'init', $_REQUEST['data']);
		}
		
		//generate a response to the caller, passing back:
		$output['response'] = array (
			'result'  => true,      //the connection has been opened
			'conn_id' => $conn_id,  //the connection id you've been assigned
			'user_id' => $user_id   //a user id that determines who is who
		);
		
		//the server did not error
		$output['result'] = true;
		break;
		
	case "jax_connect":  //==============================================================================================
		$user_id = registerSession ();   //register your user id
		$conn_id = request ('conn_id');  //the connection you wish to join
		$context = request ('context');
		
		if (isConnectionIDValid ($conn_id) == false) {
			$output['response'] = array (
				'result'  => false   //there was a problem with the request
			);
			
		} else {
			//find the connection to join in the database
			$result = $database->query ("SELECT connid FROM connections WHERE connid='$conn_id' AND context='$context';");
			if ($database->num_rows ($result) == 0) {
				//the connection was not found, return false
				$output['response'] = array (
					'result' => false  //there was a problem with the request
				);
				
			} else {
				//join the host's connection
				$database->query ("UPDATE connections SET userid2='$user_id' WHERE connid='$conn_id';");
				
				//get the other user's id
				$result = $database->query ("SELECT userid1 FROM connections WHERE connid='$conn_id';");
				list ($host_id) = $database->fetch_row ($result);
				
				//generate a response to the caller, passing back:
				$output['response'] = array (
					'result'  => true,
					'user_id' => $user_id,
					'host_id' => $host_id
				);
				
				$data = json_decode ($_REQUEST['data']);
				$data->user_id = $user_id;
				$data = json_encode ($data);
				
				//put a message on the queue for them to say you've joined
				addToQueue ($conn_id, $host_id, 'jax_join', $data);
				
				//get the data the host provided when the connection was created
				$sql = "SELECT data FROM queue WHERE connid='$conn_id' AND whoto='AWAITING' AND type='init';";
				$result = $database->query ($sql);
				if ($database->num_rows ($result) > 0) {
					list ($output['response']['data']) = $database->fetch_row ($result);
					$output['response']['data'] = json_decode ($output['response']['data']);
					
					$sql = "DELETE FROM queue WHERE connid='$conn_id' AND whoto='AWAITING' AND type='init';";
					$database->query ($sql);
				};
			};
		}
		
		//the request was processed without server error
		$output['result'] = true;
		break;
	
	case "jax_check_queue":  //==========================================================================================
		//check the queue for messages addressed to you
		$conn_id = $_REQUEST['conn_id'];  //which connection to query
		$user_id = $_REQUEST['user_id'];  //your id
		
		//retrieve a list of messages posted to you
		$result  = $database->query ("SELECT type, data FROM queue WHERE connid='$conn_id' AND whoto='$user_id';");
		//if there is one or more messages on the queue...
		if ($database->num_rows ($result) > 0) {
			//loop over each message
			while (list ($type, $data) = $database->fetch_row ($result)) {
				//generate a response containing the message
				$response = array (
					'type' => $type,
					'data' => json_decode ($data)
				);
				addResponse ($response);
				
				//delete the entry
				$sql = "DELETE FROM queue WHERE connid='$conn_id' AND whoto='$user_id' AND type='".$type."'".
				       " AND data='".$data."';"
				;
				$database->query ($sql);
			}
			
		} else {
			//there was no messages on the queue for you
			$response = array ('result' => false);
		}
		$output['result'] = true;
		break;
		
	case "jax_queue":  //================================================================================================
		//this places a message on the queue, addressed to the other player
		$conn_id = $_REQUEST['conn_id'];  //which connection is being used
		$user_id = $_REQUEST['sendto'];   //who the message is addressed to
		$type    = $_REQUEST['type'];     //what type of message this is
		$data    = $_REQUEST['data'];     //the message itself
		
		//insert the message into the queue
		addToQueue ($conn_id, $user_id, $type, $data);
		
		//return true if the message was queued successfully
		$output['result'] = true;
		break;
		
	case "jax_disconnect":  //===========================================================================================
		//remove yourself from a game, and if both players have left, delete the game
		$conn_id = $_REQUEST['conn_id'];
		$user_id = $_REQUEST['user_id'];
		$data    = $_REQUEST['data'];
		
		//get the current state of the game
		$sql = "SELECT userid1, userid2 FROM connections WHERE connid='$conn_id';";
		list ($user_id1, $user_id2) = $database->fetch_row ($database->query($sql));
		
		//if the other player has left already, just delete the connection
		if ($user_id1 == "DECEASED" || $user_id2 == "DECEASED") {
			//delete the connection
			$database->query ("DELETE FROM connections WHERE connid='$conn_id';");
		} else {
			//remove you from the connection...
			$sql = "UPDATE connections SET ".($user_id==$user_id1?'userid1':'userid2')."='DECEASED' WHERE ".
			       "connid='$conn_id';"
			;
			$database->query ($sql);
			
			//and leave a message on the queue to notify the other person
			addToQueue ($conn_id, ($user_id==$user_id1?$user_id2:$user_id1), "jax_disconnect", $data);
		}
		$output['result'] = true;
		break;
	
	default:
		$output['result'] = false;
		$output['error']  = "Unknown command";
}
//close the database
$database->close ($database);

//output the encoded string (with Prototype security marker to help prevent XSS)
echo "/*-secure-\n".json_encode($output)."\n*/";
	
/* === end of line ==================================================================================================== */ ?>