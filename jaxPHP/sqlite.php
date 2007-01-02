<?php
/* =======================================================================================================================
   server/sqlite.php
   =======================================================================================================================
   licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
   jax, jax games (c) copyright Kroc Camen 2005-2007
*/	
require_once "libs/SQLiteDB.php";

$filename = $config['db_path'].$config['db_name'];
if (!is_writable("db")) die("result=&error=".urlencode("No write permissions for DB. Please chmod 777 the ".$config['db_path']." directory and contents"));

//open the mini database
$database = new SQLiteDB($filename);

//$forcepurge = true;
if ($requesttype=="purge") {
	if(sqlite_table_exists("queue"))       $database->query("DROP TABLE queue;");
	if(sqlite_table_exists("connections")) $database->query("DROP TABLE connections;");
	
} elseif ($requesttype=="dump") {
	dump_table("queue");
	dump_table("connections");
	exit();
}

//check if the `queue` table exists
if (sqlite_table_exists("queue")==false) {
	//create the queue table (where messages are queued for collection by the other person)
	$database->query("CREATE TABLE queue (".
		"connid  CHAR(6),".   //connection id
		"whoto   CHAR(32),".  //the user id of the recipient
		"type    CHAR(20),".  //the requesttype that was sent
		"data    TEXT".       //a JSON string to be picked up
	");");
}
if (sqlite_table_exists("connections")==false) {
	//create the connections table
	$database->query("CREATE TABLE connections (".
		"connid   CHAR(6),".   //connection id for the player-to-payer connection
		"userid1  CHAR(32),".  //user id of host
		"userid2  CHAR(32)".   //user id of client
	");");
}

function sqlite_table_exists($mytable) {
	global $database;
	
	$query = $database->query("SELECT name FROM sqlite_master WHERE type='table'");
	while ($row = $database->fetch_row($query)) {
		//print_r ($tables);
	    if ($row[0] == $mytable) return(true);
	};
	return (false);
}

function dump_table($table) {
	global $database;
	
	echo "<h2>$table:</h2>";
	$sql = "SELECT * FROM $table;";
	$result = $database->query($sql);
	if ($database->num_rows($result) > 0) {
	    echo "<table cellpadding=10 border=1>";
	    while($row = $database->fetch_row($result)) {
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