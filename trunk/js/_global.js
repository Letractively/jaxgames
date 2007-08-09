/* =======================================================================================================================
   js/_global.js - functions that don't sit within the `shared` or `game` objects
   =======================================================================================================================
   licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
   Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
*/

/* > create2DArray : javascript has no built in method for creating 2D arrays
   ======================================================================================================================= 
   params * n_width       : 1-based width of the 2D array. e.g. 8 will create elements 0-7
            n_height      : 1-based height of the 2D array
            (x_initvalue) : an initial value to assign to each element in the array. any type supported (default null)
   return * array         : the 2D array
   ======================================================================================================================= */
function create2DArray (n_width, n_height, x_initvalue) {
        var arr = new Array (n_width-1);
        for (var x=0; x<n_width; x++) {
                arr[x] = new Array (n_height-1);
                for (var y=0; y<n_height; y++) {arr[x][y] = x_initvalue;}
        }
        return arr;
}

/* > bsod : the fatal error screen, no one hears your screams
   ======================================================================================================================= 
   params * (s_message) : error message to display on the bsod and console. use null to clear the bsod
            (s_url)     : url of file that caused the error (provided by native js error throwing)
            (n_line)    : line number of the error (provided by native js error throwing)
   return * true        : so that the javascript error is not ignored by the browser (when error is thrown)
   ======================================================================================================================= */
function bsod (s_message, s_url, n_line) {
        //if an error message is provided, show the bsod:
        if (s_message) {
                //construct the message, include line number and filename if provided
                s_message = (s_url?(s_url.split("/").last())+" ":"") + (n_line?"["+n_line+"]: ":"") + s_message;
                //put the message on the bsod
                document.getElementById ("bsod-msg").innerHTML = s_message ? s_message : "Check the Javascript Console for details";
                //show it (Prototype is not used here incase Prototype is the thing causing the error)
                document.getElementById ("bsod").style.display = "block";
                //show the error on the Firebug console (if present)
                console.error (s_message);
        } else {
                //otherwise hide it
                document.getElementById ("bsod").style.display = "none";
        }
        //accept the error and stop the browser (when error was thrown by the browser)
        return true;
}
//try to catch thrown errors (url and line number are provided by the browser)
if (config.use_bsod) {window.onerror = bsod;}

//=== end of line ===========================================================================================================