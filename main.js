#!/usr/bin/env node

var requirejs = require('requirejs');

requirejs(["eu/save_reader"], function main(save_reader) {
	if(process.argv.length > 2) {
	    save_reader.from_local_file(process.argv[2]);
	} else {
	    console.log("Provide .eu4 file in command line.");
	}
});
