#!/usr/bin/env node

var requirejs = require('requirejs');

requirejs.config({
    // Default root directory
    baseUrl: 'js'
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    //nodeRequire: require
});

// Hit from sebastianpatten.wordpress.com/2011/12/13/node-sharing-javascript-code-between-client-and-server/
requirejs(["eu/save_reader", "eu/load_game"], function(save_reader, load_game) {
    if(process.argv.length > 2) {
        save_reader.from_local_file(process.argv[2], function(err, save) {
            if(err) {
                console.log("Error: " + err);
            } else {
                var game = load_game(save);
                var cache = [];
                console.log(JSON.stringify(game));/*, function(key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return "CIRCULAR";
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                }));*/
            }
        });
    } else {
        console.log("Provide .eu4 file in command line.");
    }
});