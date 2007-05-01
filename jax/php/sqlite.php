<?php
/* =======================================================================================================================
   sqlite.php
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*/
require_once "libs/SQLiteDB.php";

//check for the prescence of the database and writeability
$db_path = realpath ($config['db_path'])."/";  //convert the database folder to an absolute path on the server
$db_file = $db_path.$config['db_name'];        //add the filename on the end
//is the db folder writeable?
if (!is_writable ($db_path) || (file_exists ($db_file) && !is_writeable ($db_file))) {
	die (
		//no: return a json of the error
		json_encode (array (
			'result' => false,
			'error'  => "No write permissions for DB. Please chmod 777 the ".$config['db_path']." directory and contents"
		))
	);
}

//open the mini database
$database = new SQLiteDB ($db_file);

if ($request_type == "purge") {
	if (sqlite_table_exists ("queue"))       $database->query ("DROP TABLE queue;");
	if (sqlite_table_exists ("connections")) $database->query ("DROP TABLE connections;");
	
} elseif ($request_type == "dump") {
	dump_table ("queue");
	dump_table ("connections");
	exit ();
}

//check if the `queue` table exists
if (sqlite_table_exists ("queue") == false) {
	//create the queue table (where messages are queued for collection by the other person)
	$database->query ("CREATE TABLE queue (".
		"connid  CHAR(6),".   //connection id
		"whoto   CHAR(32),".  //the user id of the recipient
		"type    CHAR(20),".  //the requesttype that was sent
		"data    TEXT".       //a JSON string to be picked up
	");");
}
if (sqlite_table_exists ("connections") == false) {
	//create the connections table
	$database->query ("CREATE TABLE connections (".
		"connid   CHAR(6),".   //connection id for the player-to-payer connection
		"userid1  CHAR(32),".  //user id of host
		"userid2  CHAR(32)".   //user id of client
	");");
}

function sqlite_table_exists ($s_table) {
	global $database;
	
	$query = $database->query ("SELECT name FROM sqlite_master WHERE type='table'");
	while ($row = $database->fetch_row ($query)) {
	    if ($row[0] == $s_table) {return true;}
	};
	return false;
}

function dump_table ($s_table) {
	global $database;
	
	echo "<h2>$s_table:</h2>";
	$result = $database->query ("SELECT * FROM $s_table;");
	if ($database->num_rows ($result) > 0) {
		echo "<table cellpadding=10 border=1>";
		while($row = $database->fetch_row ($result)) {
			echo "<tr>";
			foreach ($row as $field) {
				echo "<td>".$field."</td>";
			}
			echo "</tr>";
		}
		echo "</table>";
	}
}
	
/* === end of line ==================================================================================================== */ ?>