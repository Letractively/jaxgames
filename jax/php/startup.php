<?php
/* =======================================================================================================================
   startup.php - include a number of functions needed
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*/
//all output will be in json (http://json.org)
header ('Content-type: application/json');

/* note: there seems to be a difference between XAMPP and a real PHP install regarding ‘magic quotes’. if magic quotes is on,
         the super globals are manually stripped. this is done just to make it easier for people to run jax on a local
         computer without having to configure anything (jax is designed to be copy-paste-run) */
function fixMagicQuotes () {
	//disable automatic escaping of quotes
	set_magic_quotes_runtime (0);
	if (get_magic_quotes_gpc () || ini_get ('magic_quotes_sybase')) {
		$_GET     = magicQuotesStrip ($_GET);
		$_POST    = magicQuotesStrip ($_POST);
		$_COOKIE  = magicQuotesStrip ($_COOKIE);
		$_REQUEST = array_merge ($_GET, $_POST, $_COOKIE);
		$_FILES   = magicQuotesStrip ($_FILES);
		$_ENV     = magicQuotesStrip ($_ENV);
		$_SERVER  = magicQuotesStrip ($_SERVER);
	}
	function magicQuotesStrip ($mixed) {
		if (is_array ($mixed)) {return array_map ('magic_quotes_strip', $mixed);}
		return stripslashes ($mixed);
	}
}
fixMagicQuotes ();

//return the unique session id for this user, this will form the user id used in jax connections
session_start ();
$session_id = session_id ();

//get what is requested
$request_type = request ('request_type');

require_once 'CONFIG.php';  //user configuration, edit that page to change database location etc.
require_once 'sqlite.php';  //include the database class
//---------------------------------------------------------------------------------------------------------------------------


/* > request : return a variable from the http querystring or post
   =======================================================================================================================
   params * s_var  : the name of the item to return
   return * string : the return value, or empty string if the item is not present
   ======================================================================================================================= */
function request ($s_var) {
	//php produces a warning if you try access an array item that doesn’t exist. this also applies to the superglobals
	//$_GET, $_POST and the combined form $_REQUEST
	return (isset ($_REQUEST[$s_var])) ? $_REQUEST[$s_var] : "";
}

/* > registerSession : return a user id from their unique session id assigned to them by the webserver
   =======================================================================================================================
   return * string : the ‘user id’, an encryption of the requestor’s session id
   ======================================================================================================================= */
function registerSession () {
	$user_id = md5 (session_id().strtoupper(substr(base_convert(time(),10,35),0,6)));
	return $user_id;
}

/* > getConnectionID : produce a unique connection id based on the time and return it
   =======================================================================================================================
   return * string : the connection id, as explained
   ======================================================================================================================= */
function getConnectionID () {
	//the connection id is a unique 6-letter word that identifies the connection between two browsers. once a connection
	//is started the id is returned and the other browser requires this to join the connection and exchange data. the id
	//itself is based on the unix time number converted to base 35 (0-9,A-Z)
	return strtoupper (substr(base_convert(time(),10,35),0,6));
}

/* > isConnectionIDValid : check a string to see if it conforms to the valid format for a connection id
   =======================================================================================================================
   params * s_connid : the string in question to check
   return * boolean  : true or false if the string is valid. 6 letters, 0-9,A-Z
   ======================================================================================================================= */
function isConnectionIDValid ($s_connid) {
	//if empty string, or not enough letters: is not valid
	if (empty ($s_connid) || strlen ($s_connid) != 6) {return false;}
	//check if the letters are valid
	for (n=0; n<6; n++) {
		if (strpos ('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', substr($s_connid, n, 1)) == false) {
			return false;
		}
	}
	return true;
}

/* > addResponse : add a message to the response. when checking the queue, multiple responses may come back
   =======================================================================================================================
   param * a_response : an array of pairs to add to the responses to the user
   ======================================================================================================================= */
function addResponse ($a_response) {
	global $output;
	
	if (!isset ($output['response'])) {
		$output['response'] = array ();
	}
	array_push ($output['response'], $a_response);
}

function addToQueue ($s_connid, $s_whoto, $s_type, $s_data) {
	global $database;
	
	//insert the message into the queue
	$sql = "INSERT INTO queue (connid, whoto, type, data) VALUES ('$s_connid', '$s_whoto', '$s_type', '$s_data');";
	$database->query($sql);
}

/* === end of line ==================================================================================================== */ ?>