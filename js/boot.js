// >>>>>>>>>>>>>>>>> this work is licensed under the Creative Commons Attribution-ShareAlike 2.5 license <<<<<<<<<<<<<<<<<
/* =======================================================================================================================
   js/boot.js - load the libraries needed for the games
   ======================================================================================================================= */
/* note: in the distribution version, this page is replaced by a dojo-compressed version of the merged scripts below
   ----------------------------------------------------------------------------------------------------------------------- */
//third party libraries:
//======================
// Prototype     : extends core javascript facility to reduce the amount of genereal code everywhere
// Scriptaculous : provides animation and effects
// json          : turn an array/object in a string and back again - for sending and receiving javascript over AJAX
// Firebug Lite  : javascript logger and command line

//my libraries:
//=============
// jax.js        : establish a bridge between two computer users to send AJAX back and forth
// shared.js     : shared code between all the games
//
document.write(' \
\t<script type="text/javascript" src="../../js/libs/prototype.js"></script>\n \
\t<script type="text/javascript" src="../../js/libs/json.js"></script>\n \
\t<script type="text/javascript" src="../../js/libs/scriptaculous/scriptaculous.js?load=effects"></script>\n \
\t<script type="text/javascript" src="../../js/libs/jax.js"></script>\n \
\t<script type="text/javascript" src="../../js/shared.js"></script>\n \
');

//if Firebug is not installed in Firefox, use Firebug Lite
//in the compressed distibution, firebugx.js would be included instead to ignore the console.* calls
//therefore you can librarly use Firebug features in the code (except 'debugger();') without breaking the distribution
if (!("console" in window) || !("firebug" in console)) {
        document.write ('\t<script type="text/javascript" src="../../js/libs/firebug/firebug.js"></script>\n');
}

//=== end of line ===========================================================================================================