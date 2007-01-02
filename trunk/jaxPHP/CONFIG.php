<?php
/* =======================================================================================================================
   server/CONFIG.php - configuration options for Jax server side
   =======================================================================================================================
   licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
   jax, jax games (c) copyright Kroc Camen 2005-2007
*/

$config = array (
        //path from here to the database folder. *always* include the trailing slash. the path can be relative, or absolute
        //Mac and Linux users need to enable write permissions for this folder and its contents. if you're uploading to a
        //Windows host and do not have control over write permissions, you may have been provided with a /private or /db
        //folder below htdocs/wwwroot which is writeable
        'db_path' => "db/",
        //name of the SQLite database to connect to / make if not present
        'db_name' => "jax.sqlite"
);

/* === end of line ==================================================================================================== */ ?>