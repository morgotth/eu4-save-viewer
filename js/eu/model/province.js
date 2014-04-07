define(function() {

    var Province = function Province(id, current, original, history) {
        // Province id
        this.id = id;

        // Default attributes are current province state
        this.current = this.parseProvince(current);
        
        // original contains original attributes
        this.original = this.parseProvince(original);

        var tests = [this.current.culture, this.original.culture];
        for (var i = tests.length - 1; i >= 0; i--) {
            var test = tests[i];
            for(var j in test) {
                if(j.constructor === Array) {
                    for (var k = j.length - 1; k >= 0; k--) {
                        var t = j[k];
                        if(t["parent"]) {
                            console.log("parent found for "+test+", "+j+", "+k)
                        }
                    };
                } else {
                    if(j["parent"]) {
                        console.log("parent found for "+test+", "+j+", "+i)
                    }
                }
            }
        };

        // A list of history event with date = list of events
        this.history = history;
    };

    Province.prototype.parseProvince = function parseProvince(characteristics) {
        return {
            name: characteristics.name,
            culture: characteristics.culture,
            religion: characteristics.religion,
            capital: characteristics.capital,
            trade_goods: characteristics.trade_goods,
            hre: characteristics.hre,
            base_tax: characteristics.base_tax,
            manpower: characteristics.manpower,

            // Discovered province only
            is_city: characteristics.is_city,
            owner: characteristics.owner,
            controller: characteristics.controller,
            // Note: core is a list
            core: characteristics.core,
            trade: characteristics.trade,

            // Undiscovered province only
            native_size: characteristics.native_size,
            native_ferocity: characteristics.native_ferocity,
            native_hostileness: characteristics.native_hostileness
        }
    };

    return Province;
});