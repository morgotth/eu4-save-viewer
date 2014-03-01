define(["eu/section"], function(Section) {
    var Save = function Save() {
        this.root = new Section();
    };

    // Add a new element
    // section = section tree from root node
    // key, value: element's key and value
    Save.prototype.add_element = function(section, key, value) {
        this.root.add_element(section, key, value);
    };

    Save.prototype.to_json = function to_json(section) {
        function to_json_element(element) {
            if(element.constructor === Section) {
                // Recursive build
                return to_json(element);
            } else {
                return element;
            }
        }
        var o = {};
        if(!section) section = this.root;
        for(var i in section.elements_order) {
            var key = section.elements_order[i];

            if(section.elements[key].constructor === Array) {
                // For each items
                var items = [];
                console.log("For each "+key+" with "+section.elements[key].length
                    +" elements='"+section.elements[key].join("','")+"'");
                for(var j in section.elements[key]) {
                    var item = section.elements[key][j];
                    console.log("Push "+j+"e "+item);
                    items.push(to_json_element(item));
                }
                o[key] = items;
            } else {
                o[key] = to_json_element(section.elements[key]);
            }
        }
        return o;
    };

    return Save;
});