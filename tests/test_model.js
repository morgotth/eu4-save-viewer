#!/usr/bin/env node

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'libs/jquery-2.1.0',
        underscore: 'libs/underscore-1.6.0'
    }
});

requirejs(["eu/model/api", "../tests/test"], function(api, Test) {
    // Build some objects
    var battle = new api.Battle("name", "1572.9.22", "location", "victory",
        "type", "attacker", "defender");
    Test.assertEquals(battle.name, "name");
    Test.assertSimilar(battle.date, "1572.9.22");
    Test.assertEquals(battle.location, "location");
    Test.assertEquals(battle.victory, "victory");
    Test.assertEquals(battle.type, "type");
    Test.assertEquals(battle.attacker, "attacker");
    Test.assertEquals(battle.defender, "defender");

    var history_event = new api.HistoryEvent("name", "value");
    Test.assertEquals(history_event.name, "name");
    Test.assertEquals(history_event.value, "value");

    var province = new api.Province("id", {name: "current"}, {name: "original"}, "history");
    Test.assertSimilar(province.id, "id");
    Test.assertSimilar(province.current.name, "current");
    Test.assertSimilar(province.original.name, "original");
    Test.assertEquals(province.history, "history");

    var war = new api.War("name", "original_attacker", "original_defender",
        "attackers", "defenders", "history", {type: "casus_belli"});
    Test.assertEquals(war.name, "name");
    Test.assertEquals(war.original_attacker, "original_attacker");
    Test.assertEquals(war.original_defender, "original_defender");
    Test.assertEquals(war.attackers, "attackers");
    Test.assertEquals(war.defenders, "defenders");
    Test.assertEquals(war.history, "history");
    Test.assertEquals(war.casus_belli.type, "casus_belli");

    var attrs = {
        "name": "name_val",
        "type": "type_val",
        "skill": "skill_val",
        "location": "location_val",
        "date": "date_val",
        "hire_date": "hire_date_val",
        "death_date": "death_date_val"
    };
    var advisor = new api.Advisor(attrs);
    for(var i in attrs) {
        Test.assertSimilar(advisor[i], attrs[i], "Invalid "+i+": "+advisor[i]);
    }
});
