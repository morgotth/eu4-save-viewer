define(["eu/model/api", "eu/utils"],
        function(model, utils) {

    var load_game = function load_game(save, handler) {
        // Simple characteristics
        var start_date = save.root.elements["start_date"];
        var date = save.root.elements["date"];
        var player = save.root.elements["player"];

        // Load players list

        var players = {}, players_section = save.root.elements["players_countries"];
        for (var size = players_section.length, i = 0;
                i <= size - 2; i+=2) {
            players[players_section[i]] = players_section[i+1];
        };

        // Load complex sections

        var religions = load_religions(save.root.elements["religions"]);
        var provinces = load_provinces(save.root.elements["provinces"]);
        var countries = load_countries(save.root.elements["countries"]);
        var wars = load_wars(save.root.elements["active_war"]);
        wars = wars.concat(load_wars(save.root.elements["previous_war"]));

        var game = new model.Game(
            start_date, date, player, players, religions,
            provinces, countries, wars
        );
        if(handler) {
            handler(game);
        }
        return game;
    };

    // First section parsers

    // Load religions root's section and their characteristics
    function load_religions(religions_section) {
        var religions = {};
        for(var religion_name in religions_section.elements) {
            religions[religion_name] = {
                // Enable is optionnal (present with protestant for example)
                "enable": religions_section.elements[religion_name].elements["enable"] || null
            }
        }
        return religions;
    };

    function load_provinces(provinces_section) {
        var parsers = {
            revolt: function(date, event_desc) {
                return new model.HistoryEvent("revolt", event_desc.type || "");
            },
            advisor: function(date, event_desc) {
                // TODO : advisor always null
                if(event_desc.elements) {
                    event_desc = event_desc.elements;
                }
                return new model.Advisor({
                    name: primitive_expected(event_desc, "name"),
                    type: primitive_expected(event_desc, "type"),
                    skill: primitive_expected(event_desc, "skill"),
                    location: primitive_expected(event_desc, "location"),
                    date: leader_date(primitive_expected(event_desc, "date")),
                    hire_date: leader_date(primitive_expected(event_desc, "hire_date")),
                    death_date: leader_date(primitive_expected(event_desc, "death_date"))
                });
            }
        }
        function load_province(province_s) {
            return model.Province.prototype.parseProvince(province_s, primitive_expected, list_expected);
        }

        var default_parser = function(date, event_name, event_desc) {
            var event_history = null;

            if(utils.contains(event_name, model.Province.prototype.simple_events)) {
                // Save HistoryEvent
                event_history = new model.HistoryEvent(
                    event_name,
                    primitive_expected(event_desc));
            } else if(event_desc === "yes") {
                // "building_name = yes" found
                event_history = new model.HistoryEvent("building", event_name);
            } else if(!utils.contains(event_name, model.Province.prototype.useless_events)) {
                // Not an expected useless event
                console.log("Unexpected province event "+event_name+": "+event_desc);
            }

            return event_history;
        }

        var provinces = {};
        for(var raw_province_id in provinces_section.elements) {
            var history_section = provinces_section.elements[raw_province_id].elements["history"];
            if(!history_section) {
                console.log("Ignore invalid province "+raw_province_id);
                continue;
            }
            var province_id = Math.abs(parseInt(raw_province_id, 10));

            var current = load_province(provinces_section.elements[raw_province_id].elements);
            var original = load_province(history_section.elements);

            var history = load_history(history_section, parsers, default_parser);

            provinces[province_id] = new model.Province(province_id, current, original, history);
        }

        return provinces;
    };

    function load_countries(countries_section) {
        function load_man(type, section) {
            if(section.elements) {
                section = section.elements;
            }

            if(type == "leader") {
                return new model.MilitaryLeader({
                    name: primitive_expected(section, "name"),
                    type: primitive_expected(section, "type"),
                    activation: leader_date(primitive_expected(section, "activation")),
                    death_date: leader_date(primitive_expected(section, "death_date")),
                    // Skills section
                    skills: {
                        maneuver: primitive_expected(section, "manuever"), // LOL
                        fire: primitive_expected(section, "fire"),
                        shock: primitive_expected(section, "shock"),
                        siege: primitive_expected(section, "siege")
                    },
                    elector: primitive_expected(section, "elector")
                });
            } else {
                // Royal man
                return new model.Leader({
                    type: type,
                    name: section["name"],
                    dynasty: section["dynasty"] || null,
                    birth_date: leader_date(section["birth_date"]),
                    // Optionnal leader section
                    leader: section["leader"]? load_man("leader", section["leader"].elements): null,
                    // Skills section
                    skills: {
                        dip: section["DIP"],
                        adm: section["ADM"],
                        mil: section["MIL"]
                    },
                    // Heir only
                    succeeded: section["succeeded"]? section.succeeded === "yes" : undefined,
                    death_date: leader_date(section["death_date"]),
                    monarch_name: section["monarch_name"],
                    claim: section["claim"]
                });
            }
        }
        var parsers = {
            monarch: function(date, event_desc) {
                return load_man("monarch", event_desc);
            },
            heir: function(date, event_desc) {
                return load_man("heir", event_desc);
            },
            leader: function(date, event_desc) {
                return load_man("leader", event_desc);
            }
        }
        function load_country_state(country_s) {
            return {
                government: primitive_expected(country_s, "government"),
                mercantilism: primitive_expected(country_s, "mercantilism"),
                primary_culture: primitive_expected(country_s, "primary_culture"),
                religion: primitive_expected(country_s, "religion"),
                accepted_culture: list_expected(country_s, "accepted_culture"),
                technology_group: primitive_expected(country_s, "technology_group"),
                capital: primitive_expected(country_s, "capital")
            }
        }
        var single_events = [
            "capital","add_accepted_culture","religion",
            "monarch","heir","leader","decision",
            "primary_culture","technology_group","unit_type",
            // union = personnal union
            "union", "government"
        ];

        var default_parser = function(date, event_name, event_desc) {
            var event_history = null;

            if(utils.contains(event_name, single_events)) {
                event_history = new model.HistoryEvent(event_name, primitive_expected(event_desc));
            } else if(event_desc === "yes") {
                event_history = new model.HistoryEvent("idea", event_name)
            } else {
                console.log("Unexpected country event "+event_name+": "+event_desc);
            }

            return event_history;
        }

        var countries = {};
        for(var country_abbr in countries_section.elements) {
            var history_section = countries_section.elements[country_abbr].elements["history"];
            if(!history_section) {
                console.log("Ignore invalid country "+country_abbr);
                continue;
            }

            var current = load_country_state(countries_section.elements[country_abbr].elements);
            var original = load_country_state(history_section.elements);

            var history = load_history(history_section, parsers, default_parser);

            countries[country_abbr] = new model.Country(country_abbr, current, original, history);
        }

        return countries;
    };

    function load_wars(wars_l) {
        var parsers = {
            battle: load_battle
        };

        var single_events = [
            "add_attacker", "add_defender",
            "rem_attacker", "rem_defender"
        ];
        var useless_events = [];

        var default_parser = function(date, event_name, event_desc) {
            var event_history = null;

            if(utils.contains(event_name, single_events)) {
                event_history = new model.HistoryEvent(event_name, event_desc);
            } else if(!utils.contains(event_name, useless_events)) {
                console.log("Unexpected province event "+event_name+": "+event_desc);
            }

            return event_history;
        }

        var wars = [];

        for(var size = wars_l.length, i = 0;
            i < size; i++) {
            var elt = wars_l[i];

            var casus_belli = null;
            for(var key in elt.elements) {
                var e = elt.elements[key];
                if(e.elements && "casus_belli" in e.elements && "type" in e.elements) {
                    casus_belli = {
                        casus_belli: primitive_expected(e.elements, "casus_belli"),
                        type: primitive_expected(e.elements, "type"),
                        province: primitive_expected(e.elements, "province"),
                        target: primitive_expected(e.elements, "target")
                    }
                    break;
                }
            }

            var war = new model.War(
                primitive_expected(elt.elements, "name"),
                primitive_expected(elt.elements, "original_attacker"),
                primitive_expected(elt.elements, "original_defender"),
                list_expected(elt.elements.attacker),
                list_expected(elt.elements.defender),
                load_history(elt.elements.history, parsers, default_parser),
                casus_belli
            );
            wars.push(war);
        }

        return wars;
    };

    // Sub section parsers

    function load_battle(date, battle_section) {
        // "yes" / "no" are values in EU save file.
        var victory = (battle_section.elements["result"] === "yes");

        var raw_attacker = battle_section.elements["attacker"];
        var raw_defender = battle_section.elements["defender"];

        // Resolve battle type
        var type = null;
        for (var type in model.Battle.unit_types) {
            var units = model.Battle.unit_types[type];

            if(units.filter(function(e) { return e in raw_attacker.elements; }).length !== 0) {
                // At least one unit found
                type = type;
                break;
            }
        };

        if(type === null) {
            throw "Invalid battle: no units found.";
        }

        // Take constructor's attacker or defender
        // Build normalized battle characteristics
        function resolveUnits(characteristics) {
            var result = {"army": {}};

            // Add mandatories/optionnals parameters
            result.country = characteristics.country;
            result.losses = characteristics.losses;
            result.commander = characteristics.commander || "";

            var units = model.Battle.unit_types[type];
            for(var size = units.length, i=0;
                i < size; i++) {
                result.army[units[i]] = parseInt(characteristics[units[i]], 10) || 0;
            }

            return result;
        };

        var attacker = resolveUnits(raw_attacker.elements);
        var defender = resolveUnits(raw_defender.elements);

        return new model.Battle(
            battle_section.elements["name"],
            date,
            parseInt(battle_section.elements["location"], 10),
            victory,
            type,
            attacker,
            defender
        )
    };

    function load_history(history_section, parsers, default_parser, upper_date) {
        // Load an event (name is not a date) with parsers provided
        function load_event(date, event_name, event_desc) {
            var events = [];

            var single_element = true;

            if(event_desc.constructor === Array) {
                single_element = false;

                for(var size = event_desc.length, i=0;
                    i < size; i++) {
                    events = events.concat(load_event(
                        date, event_name,
                        event_desc[i]
                    ));
                }
            } else if(event_desc.elements_order) {
                // Section found
                single_element = false;

                if(event_desc.elements_order.length === 0) {
                    // Empty section
                    console.log("Ignore empty section in history with name: "+event_name);
                } else if(event_desc.elements_order.length === 1
                    && event_desc.elements_order[0] === event_name) {
                    // An event with same event inside (stupid bug !)
                    events = events.concat(load_event(
                        date, event_name,
                        event_desc.elements[event_name]
                    ));
                } else {
                    // An event section with characteristics
                    single_element = true;
                }
            }

            if(single_element) {
                // Single element
                var result = null;
                if(event_name in parsers) {
                    var parser = parsers[event_name];
                    result = parser(date, event_desc);
                } else if(default_parser) {
                    // Use default parser if available
                    result = default_parser(date, event_name, event_desc);
                }

                // If a parser return null, ignore result
                if(result !== null) {
                    events.push(result);
                }
            }

            return events;
        }

        var history = {};

        // Key date example: "1444.7.27"
        for(var key in history_section.elements) {
            var date_event = history_section.elements[key];

            if(utils.isDate.test(key)) {
                var date = key;

                if(!history[date]) {
                    history[date] = [];
                }

                if(date_event.constructor === Array) {
                    // This section contains a list of events in this date
                    // so more than one events occurs during this date
                    for(var size = date_event.length, i = 0;
                        i < size; i++) {
                        var sub_history = load_history(
                            date_event[i], parsers, default_parser, key
                        );
                        history[date] = history[date].concat(sub_history[date]);
                    }
                } else {
                    for(var skey in date_event.elements) {
                        if(skey === key) {
                            console.log("A date event contains a date ?!!");
                            console.log(date_event);
                        } else {
                            history[date] = history[date].concat(load_event(date, skey, date_event.elements[skey]))
                        }
                    }
                }
            } else if(upper_date) {
                var date = upper_date;

                if(!history[date]) {
                    history[date] = [];
                }

                if(upper_date === key) {
                    console.log("Upper: A date event contains a date ?!!");
                    console.log(date_event);
                } else {
                    history[date] = history[date].concat(load_event(date, key, date_event));
                }
            }
        }

        if(!upper_date) {
            // Remove date with no events before return final history
            for(var i in history) {
                if(history[i].length === 0) {
                    delete history[i];
                } else {
                    history[i] = history[i].filter(function(e) {
                        return e !== undefined && e !== null;
                    });
                }
            }
        }
        return history;
    };

    // Factorisation from many load

    // Return a primitive element (not an Array or Object)
    // Parameters:
    // - elt: variable to analyse
    // - key: optionnal key for indexing
    function primitive_expected(elt, key) {
        var e = key === undefined ? elt : elt.elements_order? elt.elements[key] : elt[key];
        if(e === null || e === undefined) {
            return null;
        }
        if(e.elements_order) {
            if(e.elements_order.length === 1) {
                return primitive_expected(e.elements[e.elements_order[0]]);
            } else {
                console.log("Expected simple element but found an invalid Section with "+e.elements_order.length+" elements for key: "+key);
                return null;
            }
        } else if(e.constructor === Array) {
            var l = e.filter(function(se) {
                // Avoid a bug with empty section
                if(se.elements_order) {
                    return se.elements[key];
                } else {
                    return se;
                }
                return result;
            });
            if(l.length !== 1) {
                console.log("Expected simple element but found a list of many elements: "+l+" for key: "+key);
                return null;
            }
            return primitive_expected(l[0], key);
        }
        return e;
    };

    // Same behavior than primitive_expected but with a list.
    function list_expected(elt, key) {
        var e = key === undefined ? elt : elt[key];
        if(!e) {
            return [];
        }
        var ret = e;
        if(e.constructor !== Array) {
            if(e.elements_order) {
                if(e.elements_order.length === 1) {
                    ret = list_expected(e.elements[e.elements_order[0]]);
                } else {
                    throw "Expected a list but found an invalid Section: "+e;
                }
            }  else {
                ret = [e];
            }
        }

        return ret.map(function(e) {
            return primitive_expected(e);
        }).filter(function(e) {
            return e !== null && e !== undefined;
        });
    };

    function leader_date(date) {
        return !date || date === "1.1.1" || date === "9999.1.1" ? null : date;
    };

    // Allow testing
    load_game.load_religions = load_religions;
    load_game.load_provinces = load_provinces;
    load_game.load_countries = load_countries;
    load_game.load_wars = load_wars;
    load_game.load_battle = load_battle;
    load_game.load_history = load_history;
    load_game.primitive_expected = primitive_expected;
    load_game.list_expected = list_expected;
    load_game.leader_date = leader_date;

    return load_game;
});
