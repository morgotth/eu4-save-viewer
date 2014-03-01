define(["eu/save", "eu/section"], function(Save, Section) {

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
        var data = data.toString();

        var save_type = data.match(/\w+\n/);
        data = data.slice(data.indexOf('\n'));

        var key_char = "[\\w\\.-]" // "[^\\s={]" // 
          , key = key_char+"+"
          , value = '(?:' + '"[^"]+"' + '|' + key + ')'
          , key_value = "(\\s*"+key+")=("+value+")"
          , section_begin = "("+key+")\\s*=\\s*\\{"
          , section_end = "}"
          , array_of_values = "((?:"+value+"\\s*)+)";

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

        var res = data.match(regex);

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

        var current_section = new Section(), debug=false, depth_indent = "", items = [];
        var fcts = {
            key_value: function (key, value) {
                key = key.trim();
                value = value.trim();

                if(debug) console.log(depth_indent+'<item name="'+key+'" value="'+value.replace(/^"|"$/g, "")+'" />');
                current_section.add_element(key, value.replace(/^"|"$/g, ""));
            },
            section_begin: function (section_name) {
                section_name = section_name.trim();

                if(debug) console.log(depth_indent+'<section name="'+section_name+'">');
                depth_indent += "    ";
                current_section = new Section(section_name, current_section);
            },
            section_end: function () {
                depth_indent = depth_indent.slice(0, -4);
                if(debug) console.log(depth_indent+"</section>");
                
                if(items.length > 0) {
                    // Current section is not a section but list
                    current_section.parent.add_element(current_section.name, items);
                    // Clear list
                    items = [];
                } else {
                    // Add current section in parent's elements
                    current_section.parent.add_element(current_section.name, current_section);
                }
                current_section = current_section.parent;
            },
            array_of_values: function (values) {
                values = values.replace(/\s+/g, ' ').split(' ').filter(function(element) {
                    return element !== "";
                })

                if(debug) console.log(depth_indent+'<array value="'+values.join(" ")+'" />');

                items = values;
            }
        };
        for(var i=0; i < res.length; i++) {
            var current_type = type(res[i]);
            fcts[current_type[0]].apply(null, current_type[1]);
        }
        // Fix missing section_end
        while(current_section.parent !== undefined) {
            fcts['section_end']();
        }
        return new Save(save_type, current_section);
    }

    return {
        from_local_file: from_local_file,
        from_string: from_string
    };
});
