#!/usr/bin/env rhino
; //this semilcolon is here to allow the script to pass JSLint, which thinks the bang above is a javascript line

load ('../js/_CONFIG.js');
IN_RHINO = true;
load ('../js/_bootfiles.js');

var argv = ["../js/_CONFIG.js"];
for (i=0; i<boot_files.length; i++) {
        argv.push ("../"+boot_files[i]);
}

argv.push ("./release/source/js/boot.js");

load ('./libs/rhino_combine.js');