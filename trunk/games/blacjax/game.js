/* =======================================================================================================================
   games/blacjax/game.js - load the scripts for this game
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*//*
   + js/CONFIG.js
   + js/boot.js [ + jax/jax.js + js/_shared.js + js/_chat.js + js/_global.js ]
   » games/blacjax/game.js [
     - games/-/_js/_cards.js
     - games/blacjax/_classes.js
     - games/blacjax/_blacjax.js
     - games/blacjax/_events.js
     - games/blacjax/_run.js
   ]
*//*
   the build process will replace this file with the files below combined into one, and then compressed so that end users
   only have to download one compressed javascript file for the game
*/
include ("../-/_js/_cards.js");
include ("_classes.js");
include ("_blacjax.js");
include ("_events.js");
include ("_run.js");

//=== end of line ===========================================================================================================