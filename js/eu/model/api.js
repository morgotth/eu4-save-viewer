define(["eu/model/battle", "eu/model/country", "eu/model/game",
            "eu/model/history_event", "eu/model/province", "eu/model/war"],
        function(Battle, Country, Game, HistoryEvent, Province, War) {
    return {
        Battle: Battle,
        Country: Country,
        Game: Game,
        HistoryEvent: HistoryEvent,
        Province: Province,
        War: War
    }
})