<?php
/* =======================================================================================================================
   startup.php - include a number of scripts of functions needed
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*/
//all output will be in json (http://json.org)
header ('Content-type: application/json');

/* note: there seems to be a difference between XAMPP and a real PHP install regarding ‘magic quotes’. if magic quotes is on,
         the super globals are manually stripped. this is done just to make it easier for people to run Jax on a local
         computer without having to configure anything (jax is designed to be copy-paste-run) */
function fixMagicQuotes () {
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

//user configuration, edit that page to change database location etc.
require_once 'CONFIG.php';

//return the unique session id for this user, this will form the user id used in jax connections
session_start ();
$session_id = session_id ();

//get what is requested
$request_type = request ('request_type');

//include the database class
require_once 'sqlite.php';


/* > request : return a variable from the http querystring or post
   =======================================================================================================================
   params * s_var  : the name of the item to return
   return * string : the return value, or empty string if the item is not present
   ======================================================================================================================= */
function request ($var) {
	//php produces a warning if you try access an array item that doesn’t exist. this also applies to the superglobals
	//$_GET, $_POST and the combined form $_REQUEST
	return (isset ($_REQUEST[$var])) ? $_REQUEST[$var] : "";
}

/* > registerSession : return a user id from their unique session id assigned to them by the webserver
   =======================================================================================================================
   return * string : the ‘user id’, an encryption of the requestor’s session id
   ======================================================================================================================= */
function registerSession () {
	$user_id = md5 (session_id().strtoupper(substr(base_convert(time(),10,35),0,6)));
	return $user_id;
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

function addToQueue ($conn_id, $whoto, $type, $data) {
	global $database;
	
	//insert the message into the queue
	$sql = "INSERT INTO queue (connid, whoto, type, data) VALUES ('$conn_id', '$whoto', '$type', '$data');";
	$database->query($sql);
}

/* === end of line ==================================================================================================== */ ?>