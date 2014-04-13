#!/usr/bin/env node

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'libs/jquery-2.1.0',
        underscore: 'libs/underscore-1.6.0'
    }
});

requirejs(["eu/save_reader", "eu/load_game", "../tests/test"],
    function(reader, load_game, Test) {
    reader.from_local_file("tests/samples/tiny_save.eu4", function assert_res(err, save) {
        if(err) {
            console.error(err);
            return;
        }

        var game = load_game(save);

        // start_date
        Test.assertEquals(game.start_date, "1444.11.11");

        // date
        Test.assertEquals(game.date, "1687.1.1");

        // player
        Test.assertEquals(game.player, "TUR");

        // players
        Test.assertSimilar(game.players, {
            "Vash": "TUR",
            "GregFR": "RUS",
            "Forelan": "MUG",
            "sisaoknight": "GER",
            "samchiel": "SWE",
            "general_lii": "HAB",
            "Souris": "POR",
            "skikool1974": "SPA",
            "Morgotth": "VEN",
            "Hokan": "MNG",
            "Ronrona": "GBR",
            "gilthib": "MAM",
            "Drei": "HSA",
            "Dr.Crapule": "FRA",
            "Mickey": "MOR"
        });

        // religions
        Test.assertSimilar(game.religions, religions_expected)

        // provinces
        Test.assertEquals(game.provinces[42].id, province_42_expected.id);
        Test.assertSimilar(game.provinces[42].current, province_42_expected.current);
        Test.assertSimilar(game.provinces[42].original, province_42_expected.original);
        Test.assertSimilar(game.provinces[42].history, province_42_expected.history);

        // countries
        //console.log(game.countries[]);

        // wars
        //console.log(game.wars[]);
    });
});

var religions_expected = religions = {
    noreligion: {
        enable: undefined
    },
    catholic: {
        enable: undefined
    },
    protestant: {
        enable: "1527.5.27"
    },
    reformed: {
        enable: "1543.4.2"
    },
    orthodox: {
        enable: undefined
    },
    sunni: {
        enable: undefined
    },
    shiite: {
        enable: undefined
    },
    buddhism: {
        enable: undefined
    },
    hinduism: {
        enable: undefined
    },
    confucianism: {
        enable: undefined
    },
    shinto: {
        enable: undefined
    },
    animism: {
        enable: undefined
    },
    shamanism: {
        enable: undefined
    },
    totemism: {
        enable: undefined
    }
}

province_42_expected = {
    "id": 42,
    "current": {
        name: "Stockholm",
        religion: "protestant",
        capital: "Stockholm",
        trade_goods: "grain",
        hre: undefined,
        base_tax: "6.000",
        manpower: "3.000",
        is_city: "yes",
        owner: "SWE",
        controller: "SWE",
        trade: "baltic_sea",
        native_size: undefined,
        native_ferocity: undefined,
        native_hostileness: undefined,
        culture: "swedish",
        core: ["SWE"]
    },
    "original": {
        add_core: "SWE"
        owner: "SWE"
        controller: "SWE"
        culture: "swedish"
        religion: "catholic"
        hre: no
        base_tax: "5.000"
        trade_goods: "grain"
        manpower: "3.000"
        capital: "Stockholm"
        is_city: "yes"
        discovered_by: "eastern"
        discovered_by: "western"
        discovered_by: "muslim"
        discovered_by: "ottoman"
    },
    "history": {
        "1446.9.23": [{"name": "controller", "value": "LIT"}],
        "1446.10.2": [{"name": "controller", "value": "TEU"}],
        "1449.4.25": [{"name": "add_claim", "value": "POM"}],
        "1454.1.25": [{"name": "controller", "value": "LIT"}],
        "1454.5.14": [{"name": "controller", "value": "TEU"}],
        "1471.10.2": [{"name": "remove_claim", "value": "POM"}],
        "1475.10.2": [{"name": "controller", "value": "POL"},{"name": "owner", "value": "POL"},{"name": "add_core", "value": "POL"}],
        "1477.10.8": [{"name": "hre", "value": "yes"}],
        "1519.4.25": [{"name": "culture", "value": "polish"}],
        "1525.11.1": [{"name": "remove_core", "value": "TEU"}],
        "1547.2.25": [{"name": "religion", "value": "protestant"}],
        "1548.10.19": [{"name": "building", "value": "dock"}],
        "1558.4.10": [{"name": "building", "value": "temple"}],
        "1588.7.30": [{"name": "controller", "value": "SWE"}],
        "1589.9.25": [{"name": "controller", "value": "POL"}],
        "1591.4.7": [{"name": "controller", "value": "BRA"},{"name": "controller", "value": "PRU"},{"name": "controller", "value": "GER"}],
        "1591.5.24": [{"name": "owner", "value": "BRA"},{"name": "owner", "value": "PRU"},{"name": "owner", "value": "GER"}],
        "1591.6.25": [{"name": "add_core", "value": "PRU"}],
        "1595.11.3": [{"name": "culture", "value": "prussian"}],
        "1603.8.9": [{"name": "building", "value": "temple"}],
        "1604.10.11": [{"name": "building", "value": "armory"}],
        "1606.4.22": [{"name": "building", "value": "constable"}],
        "1607.10.9": [{"name": "building", "value": "training_fields"}],
        "1609.2.16": [{"name": "building", "value": "barracks"}],
        "1637.6.8": [{"name": "building", "value": "regimental_camp"}],
        "1657.8.22": [{"name": "building", "value": "dock"}],
        "1676.5.5": [{"name": "add_core", "value": "GER"},{"name": "remove_core", "value": "PRU"}]
    }
}
