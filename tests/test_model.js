#!/usr/bin/env node

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '../js'
});

requirejs(["eu/model/api"], function(api) {
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
});

var Test = {
    quiet: true,
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
