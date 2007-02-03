#!/usr/bin/env rhino
; //this semilcolon is here to allow the script to pass JSLint, which thinks the bang above is a javascript line

load ('../js/CONFIG.js');

var i,
    boot_files = []
;
if (config.scriptaculous.use_provided) {
        boot_files.push ("js/libs/prototype.js");
        boot_files.push ("js/libs/scriptaculous/effects.js");
} else {
        var boot_path = "js/libs/scriptaculous/scriptaculous-js-" + Scriptaculous.Version;
        boot_files.push (boot_path+"/lib/prototype.js");
        for (i=0; i<config.boot_scripts.length; i++) {
                boot_files.push (boot_path+"/src/"+scriptaculous.includes[i]+".js");
        }
}
boot_files.push ("../js/libs/firebug/firebugx.js");
for (i=0; i<config.boot_scripts.length; i++) {
        boot_files.push (config.boot_scripts[i]);
}

var argv = [];
for (i=0; i<boot_files.length; i++) {
        argv.push ("../"+boot_files[i]);
}

argv.push ("./release/jaxgames/js/boot.js");

load ('./libs/merge.js');