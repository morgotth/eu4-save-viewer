define(["eu/save"], function(Save) {

    // Extract a local EU save file
    // Call handler with (err, save)
    function from_local_file(filepath, handler) {
        var fs = require("fs");

        fs.readFile(filepath, function (err, data) {
            if(err) {
                handler(err);
            } else {
                handler(null, from_string(data));
            }
        });
    }

    // Extract an EU save string
    function from_string(data) {
        var key = "[^\\s\\{\\}]+";
        var value = "\"?"+key+"\"?";
        var begin_of_section = "";
        var key_value = "(\s*"+key+")=("+value+")";
        var section_begin = "(\s*"+key+")\\s*=\\s*\\{";
        var section_end = "[ \t]*(})\s*";
        var array_of_values = "((?:"+value+"[ \t]*)+)";

        var regex = new RegExp("(?:"
            +key_value
            +"|"
            +section_begin
            +"|"
            +section_end
            +"|"
            +array_of_values
            +")"
        , "g");

        var res = data.toString().match(regex);

        function type(s) {
            // Matchs order by priority
            var matchs = {
                key_value: key_value,
                section_begin: section_begin,
                section_end: section_end,
                array_of_values: array_of_values
            }, matchs_found = [];

            Object.keys(matchs).forEach(function (regex_name) {
                var res = s.match(matchs[regex_name]);
                if(res !== null) {
                    // Store match name + match result
                    matchs_found.push([regex_name, res.slice(1)]);
                }
            });

            return matchs_found[0];
        }

        var save_data = new Save(), current_section = [], items = [];
        for(var i=0; i < res.length; i++) {
            var s = res[i], st = s.trim();

            var fcts = {
                display_key_value: function (current_section, key, value) {
                    var begin = current_section.length?current_section.join(".")+".":"";
                    console.log(begin + key + " = " + value);
                    save_data.add_element(current_section, key, value);
                },
                key_value: function (key, value) {
                    fcts['display_key_value'](current_section, key, value);
                },
                section_begin: function (section_name) {
                    current_section.push(section_name); items = [];
                },
                section_end: function () {
                    if(items.length > 0) {
                        fcts['display_key_value'](
                            current_section.slice(0, -1),
                            current_section.slice(-1),
                            items.join(","));
                        // Clear list
                        for(var i=0; i<items.length; i++) items.pop();
                    }
                    current_section.pop();
                },
                array_of_values: function () { items.push(st); }
            };
            var s_type = type(s);
            fcts[s_type[0]].apply(null, s_type[1]);
        }

        return save_data;
    }

    return {
        from_local_file: from_local_file,
        from_string: from_string
    };
});
