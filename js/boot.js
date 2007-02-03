/* =======================================================================================================================
   js/boot.js - load the libraries needed for the games
   ======================================================================================================================= */
/* note: in the distribution version, this page is replaced by a compressed version of the merged scripts below

   + Prototype     : extends core javascript functionality to reduce the amount of genereal code everywhere
   + Scriptaculous : provides animation and effects
   + json          : turn an array/object in a string and back again - for sending and receiving javascript over AJAX
   + Firebug Lite  : javascript logger and command line
   + jax.js        : establish a bridge between two computer users to send AJAX back and forth
   + shared.js     : shared code between all the games
*/
var i,
    boot_files = []
;
//load Scriptaculous (and Prototype)
if (config.scriptaculous.use_provided) {
        //use the provided Scriptaculous bundled with jax (stable)
        boot_files.push ("js/libs/prototype.js");
        boot_files.push ("js/libs/scriptaculous/effects.js");
} else {
        //use user-provided scriptaculous version unzipped into /js/scriptaculous/...
        var boot_path = "js/libs/scriptaculous/scriptaculous-js-" + Scriptaculous.Version;
        boot_files.push (boot_path+"/lib/prototype.js");
        for (i=0; i<config.boot_scripts.length; i++) {
                boot_files.push (boot_path+"/src/"+scriptaculous.includes[i]+".js");
        }
}
//load the rest of the boot scripts (see CONFIG.js)
for (i=0; i<config.boot_scripts.length; i++) {boot_files.push (config.boot_scripts[i]);}


/* developer only tools:
   ======================================================================================================================= */
//if Firebug is not installed in Firefox, use Firebug Lite
//in the compressed release, firebugx.js would be included instead to ignore the console.* calls therefore you can liberally
//use Firebug features in the code (except 'debugger;') without breaking the release version
if (!("console" in window) || !("firebug" in console)) {
        boot_files.push ("js/libs/firebug/firebug.js");
}

//include Shuns excellent dump script. use dump (any var); to get a block display of a variable. can be object/array
boot_files.push ("js/libs/dump_src.js");

//---------------------------------------------------------------------------------------------------------------------------
for (i=0; i<boot_files.length; i++) {
        document.write('\t<script type="text/javascript" src="../../'+boot_files[i]+'"></script>\n');
}

//=== end of line ===========================================================================================================
//licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
//jax, jax games (c) copyright Kroc Camen 2005-2007