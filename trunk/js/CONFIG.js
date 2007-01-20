/* =======================================================================================================================
   js/config.js - jax games configuration
   ======================================================================================================================= */
var config = {
        //location of the jax server side receiver
        jax_path      : "jax_php/response.php",
        
        //array of javascript files to include (ignoring Prototype & Scriptaculous)
        boot_scripts  : ["js/libs/json.js", "js/libs/jax.js", "js/shared.js"],
        
        //Scriptaculous settings...
        scriptaculous : {
                //use the version of Scriptaculous provided with Jax Games:
                //if set to false, Scriptaculous will be loaded from a unzipped Scriptaculous folder located at
                //"/js/libs/scriptaculous/scriptaculous-js-1.x.x", where the version number is set by the 'Scriptaculous'
                //object defined below. this lets you quickly switch between Scriptaculous versions just by setting this
                //option to false, and changing the version number below
                use_provided : true,
                
                //an array of which Scriptaculous libraries to include, sans extension (if use_provided = false)
                //!/includes : ["builder", "effects", "dragdrop", "controls", "slider"]  //all of Scriptaculous
                includes : ["effects"]  //just the effects only please
        }
};

//this is custom scriptaculous header to remove the load functions which would normally try load the external scripts
//the build system will instead combine the scripts together
var Scriptaculous = {
        Version: '1.6.5' //default is 1.6.5
};

//=== end of line ===========================================================================================================
//licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
//jax, jax games (c) copyright Kroc Camen 2005-2007