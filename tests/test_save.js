#!/usr/bin/env node

var requirejs = require('requirejs');

requirejs.config({
    // Default root directory
    baseUrl: '../js'
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    //nodeRequire: require
});

requirejs(["eu/save", "eu/save_reader"], function main(Save, reader) {
    reader.from_local_file("../samples/cardinals.eu4", function assert_res(err, save) {
        if(err) {
            console.error(err);
            return;
        }

        var root = save.root;

        Test.quiet = true;

        Test.assertEquals(root.name, undefined, "Root section has not an undefined name.");
        Test.assertEquals(root.elements_order.length, 4);
        Test.assertEquals(root.elements['papacy'].elements['papal_state'], "PAP");
        Test.assertEquals(root.elements['papacy'].elements['controller'], 'POR');
        Test.assertEquals(root.elements['papacy'].elements['crusade_target'], 'TUR');
        Test.assertEquals(root.elements['papacy'].elements['crusade_start'], '1577.1.7');
        Test.assertEquals(root.elements['papacy'].elements['last_excom'], '1463.11.7');
        Test.assertEquals(root.elements['papacy'].elements['papacy_active'], 'yes');
        Test.assertEquals(root.elements['papacy'].elements['weighted_cardinal'], '2');
        Test.assertEquals(root.elements['papacy'].elements['reform_desire'], '1.325');

        var cardinals = root.elements['papacy'].elements['active_cardinals'].elements['cardinal'];
        Test.assertEquals(cardinals.length, 3);
        Test.assertEquals(cardinals[0].elements['name'], "de Champmartin");

        Test.assertEquals(cardinals[0].elements['cardinal_age'], "79");
        Test.assertEquals(cardinals[0].elements['location'], "194");
        Test.assertEquals(cardinals[0].elements['controller'], "VEN");
        Test.assertEquals(cardinals[0].elements['id'].elements['id'], "59");
        Test.assertEquals(cardinals[0].elements['id'].elements['type'], "32");

        var votes = cardinals[0].elements['votes'], non_zero_values = {
            47: '50', 85: '35', 149: '15', 164: '70', 406: '15', 413: '10'
        };
        Test.assertEquals(votes.length, 515);
        for(var i in votes) {
            var item = votes[i];

            if(i in non_zero_values) {
                Test.assertEquals(votes[i], non_zero_values[i]);
            } else {
                Test.assertEquals(votes[i], '0');
            }
        }

        Test.assertEquals(cardinals[1].elements['name'], 'Pizarro');
        Test.assertEquals(cardinals[2].elements['name'], 'Carleton');

        Test.quiet = false;
    });
});

var Test = {
    quiet: false,
    fail: function (actual, expected, message) {
        console.error(message !== undefined ? message : "Error, expected "+expected+" but actual is "+actual);
    },
    assertEquals: function(actual, expected, message) {
        if(actual !== expected)
            Test.fail(actual, expected, message);
        else if(!Test.quiet)
            console.log("Valid " + expected);
    },
    assertSimilar: function (actual, expected, message) {
        if(actual.toString() !== expected.toString())
            Test.fail(actual, expected, message);
        else if(!Test.quiet)
            console.log("Valid " + expected);
    }
}
