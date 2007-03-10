<?php
/* =======================================================================================================================
   startup.php - Include a number of scripts of functions needed
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax (c) copyright Kroc Camen 2005-2007
*/
require_once "config.php";

session_start();
$session_id = session_id();

/* note: there seems to be a difference between XAMPP and a real PHP install regarding 'magic quotes'. if magic quotes is on,
         the super globals are manually stripped. this is done just to make it easier for people to run Jax on a local
         computer without having to configure anything (jax is designed to be copy-paste-run) */
set_magic_quotes_runtime(0);
if(get_magic_quotes_gpc() || ini_get('magic_quotes_sybase')) {
	$_GET     = magic_quotes_strip($_GET);
	$_POST    = magic_quotes_strip($_POST);
	$_COOKIE  = magic_quotes_strip($_COOKIE);
	$_REQUEST = array_merge($_GET, $_POST, $_COOKIE);
	$_FILES   = magic_quotes_strip($_FILES);
	$_ENV     = magic_quotes_strip($_ENV);
	$_SERVER  = magic_quotes_strip($_SERVER);
}
function magic_quotes_strip($mixed) {
   if(is_array($mixed)) return array_map('magic_quotes_strip', $mixed);
   return stripslashes($mixed);
}

//get what is requested
$requesttype = request('requesttype');

//include the database class
require_once "sqlite.php";

function request ($var) {
	return (isset($_REQUEST[$var]) ? $_REQUEST[$var] : "");
}

function register_session () {
	$userid = md5(session_id().strtoupper(substr(base_convert(time(), 10, 35), 0, 6)));
	return $userid;
}

/* === end of line ==================================================================================================== */ ?>