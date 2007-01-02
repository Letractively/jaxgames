<?php
/* =======================================================================================================================
   server/response.php - handle all request/response traffic from the clients
   =======================================================================================================================
   licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
   jax, jax games (c) copyright Kroc Camen 2005-2007
*/
//do all the common startup
require_once "startup.php";

//prepare the message to return
$response = array();

switch($requesttype) {
	case "jax_open":  //=================================================================================================
		//create an open slot for the new user. a connection id is generated, and the other person can join with this
		$userid = register_session();
		$connid = strtoupper(substr(base_convert(time(), 10, 35), 0, 6));
		
		$sql = "INSERT INTO connections (connid, userid1) VALUES ('$connid', '$userid');";
		$database->query($sql) or die("error in creating game");
		
		$response['connid'] = $connid;  //return the connection id, the other person needs this to join
		$response['userid'] = $userid;  //return your userid
		
		//place the data provided onto the queue for the other person to pickup upon joining
		addToQueue ($connid, 'AWAITING', 'init', $_REQUEST['data']);
		
		$response['result'] = true;
		break;
		
	case "jax_connect":  //==============================================================================================
		//register your user id
		$userid = register_session();
		$connid = $_REQUEST['connid'];
		$response['userid'] = $userid;
		
		//find the connection to join
		$sql = "SELECT connid FROM connections WHERE connid='$connid';";
		$result = $database->query($sql);
		if ($database->num_rows($result) == 0) {
			//the connection was not found, return false
			$response['result'] = false;
			
		} else {
			//join the host's connection
			$sql = "UPDATE connections SET userid2='$userid' WHERE connid='$connid';";
			$database->query($sql);
			
			//get the other user's id
			$sql = "SELECT userid1 FROM connections WHERE connid='$connid';";
			$result = $database->query($sql);
			list($hostid) = $database->fetch_row($result);
			$response['hostid'] = $hostid;
			
			$data = json_decode($_REQUEST['data']);
			$data->userid = urlencode($userid);
			$data = json_encode($data);
			//put a message on the queue for them to say you've joined
			addToQueue ($connid, $hostid, 'jax_join', $data);
			
			//get the data the host provided when the connection was created
			$sql = "SELECT data FROM queue WHERE connid='$connid' AND whoto='AWAITING' AND type='init';";
			$result = $database->query($sql);
			if ($database->num_rows($result) > 0) {
				list($response['data']) = $database->fetch_row($result);
				$sql = "DELETE FROM queue WHERE connid='$connid' AND whoto='AWAITING' AND type='init';";
				$database->query($sql);
			};
			
			//return true
			$response['result'] = true;
		};
		break;
	
	case "jax_check_queue":  //==========================================================================================
		//check the queue for messages addressed to you
		$connid = $_REQUEST['connid'];  //which connection to query
		$userid = $_REQUEST['userid'];  //your id
		$sql = "SELECT type, data FROM queue WHERE connid='$connid' AND whoto='$userid';";
		$result = $database->query($sql);
		//if there is more than one message on the queue
		if ($database->num_rows($result) > 0) {
			$c = 0;
			while (list($type, $data) = $database->fetch_row($result)) {
				$c++;
				$response['type'.$c] = $type;
				$response['data'.$c] = $data;
				//delete the entry
				$sql = "DELETE FROM queue WHERE connid='$connid' AND whoto='$userid' AND type='".$type."' AND data='".$data."';";
				$database->query($sql);
			}
			$response['count']  = $c;
			$response['result'] = true;
		} else {
			$response['result'] = false;
		}
		break;
		
	case "jax_queue":  //================================================================================================
		//this places a message on the queue, addressed to the other player
		$connid = $_REQUEST['connid'];  //which connection is being used
		$userid = $_REQUEST['sendto'];  //who the message is addressed to
		$type   = $_REQUEST['type'];    //what type of message this is
		$data   = $_REQUEST['data'];    //the message itself
		
		//insert the message into the queue
		addToQueue ($connid, $userid, $type, $data);
		
		//return true if the message was queued successfully
		$response['result'] = true;
		break;
		
	case "jax_disconnect":  //===========================================================================================
		//remove yourself from a game, and if both players have left, delete the game
		$connid = $_REQUEST['connid'];
		$userid = $_REQUEST['userid'];
		$data   = $_REQUEST['data'];
		
		//get the current state of the game
		$sql = "SELECT userid1, userid2 FROM connections WHERE connid='$connid';";
		list($userid1, $userid2) = $database->fetch_row($database->query($sql));
		
		//if the other player has left already, just delete the connection
		if ($userid1 == "DECEASED" || $userid2 == "DECEASED") {
			//delete the connection
			$sql = "DELETE FROM connections WHERE connid='$connid';";
			$database->query($sql);
		} else {
			//remove you from the connection...
			$sql = "UPDATE connections SET ".($userid==$userid1?'userid1':'userid2')."='DECEASED' WHERE connid='$connid';";
			$database->query($sql);
			
			//and leave a message on the queue to notify the other person
			addToQueue($connid, ($userid==$userid1?$userid2:$userid1), "jax_disconnect", $data);
		}
		break;
}
$r = "requesttype=".urlencode($requesttype);
foreach ($response as $key=>$value) {
	$r.="&".$key."=".urlencode($value);
}
echo $r;
$database->close($database);

function addToQueue ($connid, $whoto, $type, $data) {
	global $database;
	//insert the message into the queue
	$sql = "INSERT INTO queue (connid, whoto, type, data) VALUES ('$connid', '$whoto', '$type', '$data');";
	$database->query($sql);
}
	
/* === end of line ==================================================================================================== */ ?>