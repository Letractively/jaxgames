#!/usr/bin/env rhino
; //this semilcolon is here to allow the script to pass JSLint, which thinks the bang above is a javascript line

load ('./libs/rhino_shared.js');

//get the arguments from the command line. if argv is already defined, ignore this step. the reason this is done, is so that
//another script in rhino can preload the argv array with parameters wanted, and then `load('rhino_combine.js');` to run this
//script within Rhino, and within another currently running Rhino script. 'rhino_makeboot.js' uses this ability to
//dynamically build the list of parameters for this script
if (argv == null) {
        var argv = new Array ();
        for (i in arguments) {
                argv.push (arguments[i]);
        }
}

if (argv.length < 2) {
        print ("usage: infile.js [infile2.js] [infile3.js] [...] outfile.js");
} else {
        var inpath    = argv [0],
            outpath   = argv [argv.length-1],
            read_file = "",
            total     = 0,
            code_raw  = ""
        ;
        for (var i=0; i<argv.length-1; i++) {
                read_file = readFile (argv[i]);
                print ("  merging "+argv[i]+" ("+formatFileSize(read_file.length)+")");
                total += read_file.length; 
                code_raw += read_file + "\n";
        }
	writeFile (outpath, code_raw);
        print ("  total: "+formatFileSize(total));
}