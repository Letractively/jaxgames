/* =======================================================================================================================
   js/boot.js - load the libraries needed for the games
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax, jax games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   the code in this page only exists in the source code for jax games. the build system will create a 'release' version of
   jax games where most of the scripts will be merged and compressed into a single file, replacing boot.js (see '_build/').
   this means that users will have to download a lot less scripts, speeding up load times. also, this means that additional
   developer only code and scripts can be loaded here, and will not appear in the release version.
*//*
   the build system will take the following scripts and merge them into a replacement boot.js:

   + Prototype     : extends core javascript functionality to reduce the amount of genereal code everywhere
   + Scriptaculous : provides animation and effects
   + Firebug Lite  : javascript logger and command line
   + jax.js        : establish a bridge between two computer users to send AJAX back and forth
   + shared.js     : shared code between all the games
*//*
   also, the build system actually loads and runs this very page itself to select which javascripts to merge. this is where
   the `IN_RHINO` flag states whether this page is running in the browser, or inside the build system. this flag is only
   valid on this page, and has no effect anywhere else in the codebase
*/

/* > include : load another javascript file
   ======================================================================================================================= */
function include (s_filename) {
        //this function (or at least its name) is vital to the build process. files that call this function will have the
        //referenced file injected at that point, reducing the number of javascript files loaded in the compiled project.
        //this increases the compression factor, and reduces the number of http requests, speeding up loading times
        document.write ('\t<script type="text/javascript" src="'+s_filename+'"></script>\n');
}


//disable the bsod for developers only. you are expected to use Firebug <getfirebug.com> to trap and view errors. the bsod
//is, as its name implies, a replica blue screen of death that appears when a fatal javascript error occurs. this is so that
//the end user can see the game has crashed, instead of 
config.use_bsod = false;

//load Scriptaculous (and Prototype)
var i = 0, boot_files = [];
boot_files.push ("js/_libs/scriptaculous/scriptaculous.js");
if (config.scriptaculous.use_defaults) {
        //use the provided Scriptaculous bundled with jax (stable)
        boot_files.push ("js/_libs/scriptaculous/prototype.js");
        boot_files.push ("js/_libs/scriptaculous/effects.js");
} else {
        //use user-provided Prototype & Scriptaculous (see 'js/CONFIG.js' for details on this)
        boot_files.push (config.scriptaculous.custom_prototype);
        for (i=0; i<config.scriptaculous.includes.length; i++) {
                boot_files.push (config.scriptaculous.custom_src+config.scriptaculous.includes[i]+".js");
        }
}


/* === developer only tools: ============================================================================================= */
//if running in the browser...
if (!IN_RHINO) {
        //if Firebug is not installed in Firefox, use Firebug Lite
        if (!("console" in window) || !("firebug" in console)) {
                boot_files.push ("js/_libs/firebug/firebug.js");
        }
        //include Shuns excellent dump script. use `dump (any_var);` to get a block display of an object/array
        boot_files.push ("js/_libs/dump_src.js");
        
} else {
        //in the compressed release, firebugx.js is included instead to ignore the `console.*` calls. therefore you can
        //liberally use Firebug features in the code (except `debugger;`) without breaking the release version
        boot_files.push ("js/_libs/firebug/firebugx.js");
}

//load the rest of the boot scripts
boot_files.push ("jax/jax.js", "js/_shared.js");

//---------------------------------------------------------------------------------------------------------------------------
//now include all the scripts chosen above. not required in the build system, as it will take the `boot_files` array we've
//built and compress them together. see "/_build/libs/rhino_makeboot.js"
if (!IN_RHINO) {
        for (i=0; i<boot_files.length; i++) {
                include ("../../"+boot_files[i]);
        }
}

//=== end of line ===========================================================================================================
//'js/CONFIG.js' « previous                                                                             next » 'js/shared.js'