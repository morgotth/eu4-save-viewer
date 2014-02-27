#!/usr/bin/env node

var fs = require("fs");
    //, process = require("process");

var reader = (function(reader) {
    function from_file(filepath) {
        fs.readFile(filepath, function (err, data) {
            if(err) {
                console.log(err);
            } else {
                reader.from_string(data);
            }
        });
    }

    function from_string(data) {
        var key = "[\\w]+";
        var value = "\"?[\\w\\. ]+\"?";
        var begin_of_section = "";
        var key_value = "(\s*"+key+")=("+value+")";
        var section_begin = "(\s*"+key+")=\\s*\\{";
        var section_end = "[ \t]*(})\s*";
        var array_of_values = "((?:"+value+"[ \t]*)+)";

        var regex = new RegExp("(?:"
            +key_value
            +"|"
            +section_begin
            +"|"
            +section_end
            +"|"
            // array of values
            +array_of_values
            +")"
        , "g");

        function type(s) {
            // Matchs order by priority
            var matchs = {
                key_value: key_value,
                section_begin: section_begin,
                section_end: section_end,
                array_of_values: array_of_values
            }, matchs_found = [];

            Object.keys(matchs).forEach(function (element) {
                if(s.match(matchs[element]) !== null) {
                    matchs_found.push(element);
                }
            });

            return matchs_found[0];
        }

        var res = data.toString().match(regex);

        var current_sections = [], items = [];
        for(var i=0; i < res.length; i++) {
            var s = res[i], st = s.trim();

            var fcts = {
                display_key_value: function (current_sections, key, value) {
                    var begin = current_sections.length?current_sections.join(".")+".":"";
                    console.log(begin + key + " = " + value);
                },
                key_value: function () {
                    var res = s.match(key_value);
                    fcts['display_key_value'](current_sections, res[1], res[2]);
                },
                section_begin: function () {
                    current_sections.push(s.match(section_begin)[1].trim()); items = [];
                },
                section_end: function () {
                    if(items.length > 0) {
                        fcts['display_key_value'](
                            current_sections.slice(0, -1),
                            current_sections.slice(-1),
                            items.join(","));
                        // Clear list
                        for(var i=0; i<items.length; i++) items.pop();
                    }
                    current_sections.pop();
                },
                array_of_values: function () { items.push(st); }
            };
            fcts[type(s)]();
        }
    }

    reader.from_file = from_file;
    reader.from_string = from_string;

    return reader;
})({});

if(process.argv.length > 2) {
    reader.from_file(process.argv[2]);
} else {
    console.log("Provide .eu4 file in command line.");
}
