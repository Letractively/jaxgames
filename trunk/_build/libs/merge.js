#!/usr/bin/env rhino
; //this semilcolon is here to allow the script to pass JSLint, which thinks the bang above is a javascript line

//get the arguments from the command line. if argv is already defined, ignore this step. the reason this is done, is so that
//another script in rhino can preload the argv array with parameters wanted, and then `load('merge.js');` to run this script
//within Rhino, and within another currently running Rhino script. 'mergeboot.js' uses this ability to dynamically build the
//list of parameters for this script
if (argv == null) {
        var argv = new Array ();
        for (i in arguments) {
                argv.push (arguments[i]);
        }
}

// get the input file, toss it into the big ugly black box,
// and save the output
function main () {
        if (argv.length < 2) {
                print("usage: infile.js [infile2.js] [infile3.js] [...] outfile.js");
        } else {
                var inpath    = argv[0],
                    outpath   = argv[argv.length-1],
                    read_file = "",
                    total     = 0,
                    codeRaw   = ""
                ;
                for (var i=0; i<argv.length-1; i++) {
                        read_file = readFile (argv[i]);
                        print ("  merging "+argv[i]+" ("+formatFileSize(read_file.length)+")");
                        total += read_file.length; 
                        codeRaw += read_file + "\n";
                }
                writer = java.io.FileWriter (outpath);
                writer.write (codeRaw);
                writer.close ();
                print ("  total: "+formatFileSize(total));
        }
}

function formatFileSize (n_bytes) {
        if (n_bytes < 1024 ) {
                return n_bytes + " b";
                
        } else if (n_bytes < 1024000 ) {
                return round_decimals (n_bytes / 1024, 1) + " KB";
        } else {
                return round_decimals (n_bytes / 1024000, 2 ) + " MB";
        }
}

//---------------------------------------------------------------------------------------------------------------------------
/* This script is Copyright (c) Paul McFedries and 
Logophilia Limited (http://www.mcfedries.com/).
Permission is granted to use this script as long as 
this Copyright notice remains in place.*/

function round_decimals(original_number, decimals) {
    var result1 = original_number * Math.pow(10, decimals),
        result2 = Math.round(result1),
        result3 = result2 / Math.pow(10, decimals)
    ;
    return pad_with_zeros(result3, decimals);
}

function pad_with_zeros(rounded_value, decimal_places) {
    var value_string = rounded_value.toString(),      // Convert the number to a string
        decimal_location = value_string.indexOf(".")  // Locate the decimal point
    ;
    
    // Is there a decimal point?
    if (decimal_location == -1) {
        
        // If no, then all decimal places will be padded with 0s
        decimal_part_length = 0;
        
        // If decimal_places is greater than zero, tack on a decimal point
        value_string += decimal_places > 0 ? "." : "";
    }
    else {

        // If yes, then only the extra decimal places will be padded with 0s
        decimal_part_length = value_string.length - decimal_location - 1;
    }
    
    // Calculate the number of decimal places that need to be padded with 0s
    var pad_total = decimal_places - decimal_part_length;
    
    if (pad_total > 0) {
        
        // Pad the string with 0s
        for (var counter = 1; counter <= pad_total; counter++) 
            value_string += "0";
        }
    return value_string;
}

main ();