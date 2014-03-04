define(["eu/section"], function(Section) {
    var Save = function Save(save_type, root) {
        this.save_type = save_type;
        this.root = root || new Section();
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
                for(var j in section.elements[key]) {
                    var item = section.elements[key][j];
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