//this is a custom scriptaculous header to remove the load functions which would normally try load the external scripts.
//(see 'js/_libs/scriptaculous/scriptaculous.js') the build system will instead combine the scripts together
var Scriptaculous = {
        Version: (config.scriptaculous.use_defaults) ? '1.8.0_pre1' : config.scriptaculous.custom_version
};