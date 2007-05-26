#!/usr/bin/env rhino
; //this semilcolon is here to allow the script to pass JSLint, which thinks the bang above is a javascript line

load ('./libs/rhino_shared.js');

//take a javascript or css file, and merge any dependencies into it from an "include" / "@import" command

var argv = new Array ();
for (i in arguments) {
        argv.push (arguments[i]);
}

//get the path of the passed file
var path  = argv[0].substr (0, argv[0].lastIndexOf("/")+1),
    regex = /(?:include|@import) ?\(?["']?([a-z0-9_\.\/]+\.(?:js|css))["']?\)?;?/gi
;

//read specified file
var read_file = readFile (argv[0]);
if (read_file.match (regex)) {
        print ("  combining "+argv[0]+" ("+formatFileSize(read_file.length)+") dependencies...");

        //replace any include / @import commands with the actual files referenced
        read_file = read_file.replace (
                regex,
                function(s_str, s_1){
                        var include_file = readFile (path + s_1);
                        print ("  including "+path+s_1+"... ("+formatFileSize(include_file.length)+")");
                        return include_file + "\n";
                }
        );
        print ("  total: "+formatFileSize(read_file.length));

        writer = java.io.FileWriter (argv[0]);
        writer.write (read_file);
        writer.close ();
}