/* =======================================================================================================================
   js/boot.js - load the libraries needed for the games
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   the code in this page only exists in the source code for jax games. the build system will create a 'release' version of
   jax games where most of the scripts will be merged and compressed into a single file, replacing this file
   (see '_build/about.txt'). this means that users will have to download a lot less scripts, speeding up load times
*/

//do not change this value. rhino is the java based javascript engine the build process runs on, which will override the
//below value (see "/_build/libs/rhino_makeboot.js") so that '_bootfiles.js' may use a different configuration when building
//the compressed version of the project
IN_RHINO = false;

/* > $import : load another javascript file
   ======================================================================================================================= */
function $import (s_filename) {
        //this function (or at least its name) is vital to the build process. files that call this function will have the
        //referenced file injected at that point, reducing the number of javascript files loaded in the compiled project.
        //this increases the compression factor, and reduces the number of http requests, speeding up loading times. for
        //more details, read '_build/about.txt'
        document.write ('\t<script type="text/javascript" src="'+s_filename+'"></script>\n');
}
$import ("../../js/_CONFIG.js");
$import ("../../js/_bootfiles.js");