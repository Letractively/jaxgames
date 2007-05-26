#!/usr/bin/env rhino
; //this semilcolon is here to allow the script to pass JSLint, which thinks the bang above is a javascript line

load ('../js/CONFIG.js');
IN_RHINO = true;
load ('../js/boot.js');

var argv = [];
for (i=0; i<boot_files.length; i++) {
        argv.push ("../"+boot_files[i]);
}

argv.push ("./release/jaxgames/js/boot.js");

load ('./libs/merge.js');