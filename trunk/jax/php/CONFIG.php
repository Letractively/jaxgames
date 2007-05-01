<?php
/* =======================================================================================================================
   CONFIG.php - configuration options for Jax server side
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*/

$config = array (
	//path from here to the database folder. the path can be relative, or absolute. Mac and Linux users need to enable
	//write permissions for this folder and its contents. if you're uploading to a Windows host and do not have control
	//over write permissions, you may have been provided with a '/private' or '/db' writable folder below 'htdocs'
	'db_path' => '../db/',
	//name of the SQLite database to connect to / make if not present
	'db_name' => 'jax.sqlite'
);

/* === end of line ==================================================================================================== */ ?>