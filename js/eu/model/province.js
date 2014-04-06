define(function() {

    var Province = function Province(id, current, original, history) {
        // Province id
        this.id = id;

        // Default attributes are current province state
        this.current = this.parseProvince(current);
        
        // original contains original attributes
        this.original = this.parseProvince(original);

        // A list of history event with date = list of events
        this.history = history;
    };

    Province.prototype.parseProvince = function parseProvince(characteristics) {
        return {
            name: characteristics.name,
            owner: characteristics.owner,
            controller: characteristics.controller,
            // Note: core is a list
            core: characteristics.core,
            trade: characteristics.trade,
            culture: characteristics.culture,
            religion: characteristics.religion,
            capital: characteristics.capital,
            is_city: characteristics.is_city,
            base_tax: characteristics.base_tax,
            hre: characteristics.hre
        }
    };

    return Province;
});