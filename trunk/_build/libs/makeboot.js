#!/usr/bin/env rhino
; //this semilcolon is here to allow the script to pass JSLint, which thinks the bang above is a javascript line

load ('../js/CONFIG.js');

var i,
    boot_files = []
;
//load Scriptaculous (and Prototype)
if (config.scriptaculous.use_defaults) {
        //use the provided Scriptaculous bundled with jax (stable)
        boot_files.push ("js/libs/scriptaculous/prototype.js");
        boot_files.push ("js/libs/scriptaculous/effects.js");
} else {
        //use user-provided Prototype & Scriptaculous
        boot_files.push (config.scriptaculous.custom_prototype);
        for (i=0; i<config.boot_scripts.length; i++) {
                boot_files.push (config.scriptaculous.custom_src+config.scriptaculous.includes[i]+".js");
        }
}
boot_files.push ("js/libs/firebug/firebugx.js");
for (i=0; i<config.boot_scripts.length; i++) {
        boot_files.push (config.boot_scripts[i]);
}

var argv = [];
for (i=0; i<boot_files.length; i++) {
        argv.push ("../"+boot_files[i]);
}

argv.push ("./release/jaxgames/js/boot.js");

load ('./libs/merge.js');