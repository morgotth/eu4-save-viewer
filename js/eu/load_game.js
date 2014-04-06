define(["eu/model/api", "eu/utils"],
        function(model, utils) {

    var load_game = function load_game(save, handler) {
        console.log("Load an "+save.save_type+" save");

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
    var load_religions = function load_religions(religions_section) {
        var religions = {};
        for(var religion_name in religions_section.elements) {
            religions[religion_name] = {
                // Enable is optionnal (present with protestant for example)
                "enable": religions_section.elements[religion_name].elements["enable"] || null
            }
        }
        return religions;
    };

    var load_provinces = function load_provinces(provinces_section) {
        var parsers = {
            revolt: function(date, event_desc) {
                return new model.HistoryEvent("revolt", event_desc.type);
            }
        }
        function load_province(province_s) {
            return {
                name: primitive_expected(province_s.name),
                owner: primitive_expected(province_s.owner),
                controller: primitive_expected(province_s.controller),
                core: list_expected(province_s.core),
                trade: primitive_expected(province_s.trade),
                culture: primitive_expected(province_s.culture),
                religion: primitive_expected(province_s.religion),
                capital: primitive_expected(province_s.capital),
                is_city: primitive_expected(province_s.is_city),
                base_tax: primitive_expected(province_s.base_tax),
                hre: primitive_expected(province_s.hre)
            }
        }
        var single_events = [
            "controller","add_claim","remove_claim", "owner",
            "add_core","remove_core","hre","culture","religion", "base_tax",
            "revolt_risk"
        ];
        var useless_events = ["discovered_by"];

        var default_parser = function(date, event_name, event_desc) {
            var event_history = null;

            if(event_desc === "yes") {
                event_history = new model.HistoryEvent("building", event_name)
            } else if(utils.contains(event_name, single_events)) {
                event_history = new model.HistoryEvent(event_name, event_desc);
            } else if(!utils.contains(event_name, useless_events)) {
                console.log("Unexpected province event "+event_name+": "+event_desc);
            }

            return event_history;
        }

        var provinces = {};
        for(var raw_province_id in provinces_section.elements) {
            var province_id = Math.abs(parseInt(raw_province_id, 10));
            var history_section = provinces_section.elements[raw_province_id].elements["history"];

            var current = load_province(provinces_section.elements[raw_province_id].elements);
            var original = load_province(history_section.elements);

            var history = load_history(history_section, parsers, default_parser);

            provinces[province_id] = new model.Province(province_id, current, original, history);
        }

        return provinces;
    };

    var load_countries = function load_countries(countries) {
        // TODO
        return {};
    };

    var load_wars = function load_wars(wars_l) {
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
                        casus_belli: primitive_expected(e.elements["casus_belli"]),
                        type: primitive_expected(e.elements["type"]),
                        province: primitive_expected(e.elements["province"]),
                        target: primitive_expected(e.elements["target"])
                    }
                    break;
                }
            }

            if(casus_belli === null) {
                throw "No casus belli found for war: "+elt.elements.name;
            }

            var war = new model.War(
                primitive_expected(elt.elements.name),
                primitive_expected(elt.elements.original_attacker),
                primitive_expected(elt.elements.original_defender),
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

    var load_battle = function load_battle(date, battle_section) {
        // "yes" / "no" are values in EU save file.
        var victory = (battle_section.elements["result"] === "yes");

        var raw_attacker = battle_section.elements["attacker"];
        var raw_defender = battle_section.elements["defender"];

        // Resolve battle type
        var type = null;
        for (var type in model.Battle.unit_types) {
            var units = model.Battle.unit_types[type];

            if(units.filter(function(e) { return e in raw_attacker; })) {
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
            utils.parseDate(date),
            parseInt(battle_section.elements["location"], 10),
            victory,
            type,
            attacker,
            defender
        )
    };

    var load_history = function load_history(history_section, parsers, default_parser, upper_date) {
        // Load an event (name is not a date) with parsers provided
        function load_event(date, event_name, event_desc) {
            var events = [];

            var single_element = true;

            if(event_desc.elements_order) {
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
                var date = utils.parseDate(key);

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
                var date = utils.parseDate(upper_date);

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
                }
            }
        }
        return history;
    };

    // Factorisation from many load
    var primitive_expected = function primitive_expected(elt) {
        if(!elt) {
            return null;
        }
        if(elt.elements_order) {
            if(elt.elements_order.length === 1) {
                return primitive_expected(elt.elements[elt.elements_order[0]]);
            } else {
                throw "Expected simple element but found a Section";
            }
        } else if(elt.constructor === Array) {
            if(elt.length !== 1)
                throw "Excpected simple element but found a list of many elements: "+elt;
            return primitive_expected(elt[0]);
        }
        return elt;
    }

    var list_expected = function list_expected(elt) {
        if(!elt) {
            return [];
        }
        if(elt.constructor !== Array) {
            if(elt.elements_order) {
                if(elt.elements_order.length === 1) {
                    return list_expected(elt.elements_order[0]);
                } else {
                    throw "Expected a list but found a Section";
                }
            } else {
                return [elt];
            }
        }
        return elt;
    }

    return load_game;
});
