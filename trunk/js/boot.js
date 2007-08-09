/* > include : load another javascript file
   ======================================================================================================================= */
function include (s_filename) {
        //this function (or at least its name) is vital to the build process. files that call this function will have the
        //referenced file injected at that point, reducing the number of javascript files loaded in the compiled project.
        //this increases the compression factor, and reduces the number of http requests, speeding up loading times. for
        //more details, read '_build/about.txt'
        document.write ('\t<script type="text/javascript" src="'+s_filename+'"></script>\n');
}
include ("../../js/_CONFIG.js");
include ("../../js/_bootfiles.js");