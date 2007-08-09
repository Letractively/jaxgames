/* =======================================================================================================================
   js/config.js - jax games configuration
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*/
var config = {
        //configurations we'll apply to jax, the browser-to-browser AJAX lib (see 'jax/jax.js')
        jax : {
                //location of the jax server side receiver
                path : "jax/php/response.php",
                //number of seconds inbetween checking server for updates. default is 3. you can set this to 1 for a LAN game
                interval : 3
        },
        
        //Script.aculo.us animation settings...
        scriptaculous : {
                //use the version of Scriptaculous & Prototype provided with Jax Games?
                //if set to false, the custom locations below will be used to load them. this is so you can test with
                //unreleased/custom versions of scriptaculous & prototype with little hassle
                use_defaults : true,
                
                //location to your own copy of prototype to use
                //?/custom_prototype : "js/_libs/scriptaculous/scriptaculous-js-svn/lib/prototype.js",
                custom_prototype : "js/_libs/scriptaculous/prototype-svn/dist/prototype.js",
                //location to your own folder containing a copy of scriptaculous to use (always include end slash)
                custom_src       : "js/_libs/scriptaculous/scriptaculous-js-svn/src/",
                //you'll have to specify the version number of your own copy
                custom_version   : "1.8.0.svn",
                
                //an array of which Scriptaculous libraries to include, sans extension (if use_defaults = false)
                //?/includes : ["builder", "effects", "dragdrop", "controls", "slider", "sound"]  //all of Scriptaculous
                includes : ["effects"]  //just the effects only please
        },
        
        //use the bsod for javascript errors? do not change this value - it is overided in 'js/boot.js' so that only the 
        //compressed, release version of jax games will show the bsod on errors. this is so that end-users can tell when an
        //error has actually occured, instead of the game just hanging mid-play with no indication that it has failed
        use_bsod : true
};

//do not change this value. rhino is the java based javascript engine the build process runs on, which includes this script,
//then overrides the below value (see "/_build/libs/rhino_makeboot.js") so that boot.js may use a different configuration
//when building the compressed version of the project
IN_RHINO = false;

//=== end of line ===========================================================================================================