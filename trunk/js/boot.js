/* =======================================================================================================================
   js/boot.js - load the libraries needed for the games
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   jax, jax games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   the code in this page only exists in the source code for jax games. the build system will create a ‘release’ version of
   jax games where most of the scripts will be merged and compressed into a single file, replacing boot.js (see ‘_build/’).
   this means that users will have to download a lot less scripts, speeding up load times. also, this means that additional
   developer only code and scripts can be loaded here, and will not appear in the release version.
*//*
   the build system will take the following scripts and merge them into a replacement boot.js:

   + Prototype     : extends core javascript functionality to reduce the amount of genereal code everywhere
   + Scriptaculous : provides animation and effects
   + json          : turn an array/object in a string and back again - for sending and receiving javascript over AJAX
   + Firebug Lite  : javascript logger and command line
   + jax.js        : establish a bridge between two computer users to send AJAX back and forth
   + shared.js     : shared code between all the games
*/

//disable the bsod for developers only. you are expected to use Firebug <getfirebug.com> to trap and view errors
config.use_bsod = false;

//load Scriptaculous (and Prototype)
var i = 0, boot_files = [];
boot_files.push ("js/libs/scriptaculous/scriptaculous.js");
if (config.scriptaculous.use_defaults) {
        //use the provided Scriptaculous bundled with jax (stable)
        boot_files.push ("js/libs/scriptaculous/prototype.js");
        boot_files.push ("js/libs/scriptaculous/effects.js");
} else {
        //use user-provided Prototype & Scriptaculous (see ‘js/CONFIG.js’ for details on this)
        boot_files.push (config.scriptaculous.custom_prototype);
        for (i=0; i<config.boot_scripts.length; i++) {
                boot_files.push (config.scriptaculous.custom_src+config.scriptaculous.includes[i]+".js");
        }
}
//load the rest of the boot scripts (see ‘js/CONFIG.js’)
for (i=0; i<config.boot_scripts.length; i++) {boot_files.push (config.boot_scripts[i]);}


/* developer only tools:
   ======================================================================================================================= */
//if Firebug is not installed in Firefox, use Firebug Lite
//in the compressed release, firebugx.js would be included instead to ignore the `console.*` calls. therefore you can
//liberally use Firebug features in the code (except `debugger;`) without breaking the release version
if (!("console" in window) || !("firebug" in console)) {
        boot_files.push ("js/libs/firebug/firebug.js");
}

//include Shuns excellent dump script. use `dump (any_var);` to get a block display of an object/array
boot_files.push ("js/libs/dump_src.js");

//---------------------------------------------------------------------------------------------------------------------------
//now include all the scripts chosen above:
for (i=0; i<boot_files.length; i++) {
        document.write('\t<script type="text/javascript" src="../../'+boot_files[i]+'"></script>\n');
}

//=== end of line ===========================================================================================================
//‘js/CONFIG.js’ « previous                                                                             next » ‘js/shared.js’