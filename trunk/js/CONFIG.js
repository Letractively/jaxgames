/* =======================================================================================================================
   js/config.js - jax games configuration
   ======================================================================================================================= */
var config = {
        //location of the jax server side receiver
        jax_path      : "jax/php/response.php",
        
        //array of javascript files to include (ignoring Prototype & Scriptaculous)
        boot_scripts  : ["js/libs/json.js", "jax/jax.js", "js/shared.js"],
        
        //Scriptaculous settings...
        scriptaculous : {
                //use the version of Scriptaculous provided with Jax Games:
                //if set to false, Scriptaculous will be loaded from a unzipped Scriptaculous folder located at
                //'js/libs/scriptaculous/scriptaculous-js-?', where '?' is set by `version` below
                use_provided : true,
                
                //if use_provded above is false, use this version of scriptaculous below
                version : '1.7.0.svn',
                
                //an array of which Scriptaculous libraries to include, sans extension (if use_provided = false)
                //!/includes : ["builder", "effects", "dragdrop", "controls", "slider"]  //all of Scriptaculous
                includes : ["effects"]  //just the effects only please
        }
};

//this is custom scriptaculous header to remove the load functions which would normally try load the external scripts.
//the build system will instead combine the scripts together
var Scriptaculous = {
        Version: (config.scriptaculous.use_provided) ? '1.7.0' : config.scriptaculous.version
};

//=== end of line ===========================================================================================================
//licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
//jax, jax games (c) copyright Kroc Camen 2005-2007