#!/usr/bin/env node

var requirejs = require('requirejs');

requirejs.config({
    // Default root directory
    baseUrl: 'js',
    // Bypass baseUrl for each module that begin with following paths
    paths: {
        jquery: 'libs/jquery-2.1.0',
        underscore: 'libs/underscore-1.6.0'
    }
});

// Hit from sebastianpatten.wordpress.com/2011/12/13/node-sharing-javascript-code-between-client-and-server/
requirejs(["eu/save_reader", "eu/load_game"], function(save_reader, load_game) {
    if(process.argv.length > 2) {
        save_reader.from_local_file(process.argv[2], function(err, save) {
            if(err) {
                console.log("Error: " + err);
            } else {
                var game = load_game(save);

                // Output JSON game to terminal
                console.log(JSON.stringify(game));

                // Comment previous block with /* to allow circular protection
                /*/var cache = [];
                console.log(JSON.stringify(game, function(key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return "CIRCULAR";
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                }));//*/
            }
        });
    } else {
        console.log("Provide .eu4 file in command line.");
    }
});