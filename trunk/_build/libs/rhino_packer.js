#!/usr/bin/env rhino
;
load ("./libs/rhino_shared.js");
load ("./libs/packer31/base2.js");
load ("./libs/packer31/Packer.js");
load ("./libs/packer31/Words.js");

// arguments
var inFile  = arguments[0];
var outFile = arguments[1] || inFile.replace (/\.js$/, "-p.js");

// options
var base62 = true;
var shrink = true;

var script = readFile (inFile), 
    start  = new Date()
;
print ("  compressing "+inFile+" ("+formatFileSize(script.length)+" bytes)...");
var packer = new Packer;
var packedScript = packer.pack (script, base62, shrink);

writeFile (outFile, packedScript);

var end     = new Date(),
    elapsed = Math.floor((end.getTime() - start.getTime()) / 1000)
;
print ("  finished! ("+elapsed+"s "+formatFileSize(packedScript.length)+" -"+(100-Math.floor((packedScript.length/script.length)*100))+"%)");
