define(function () {
	var Save = function Save() {
		this.data = {};
		this.sections_order = [];
	};

	Save.prototype.add_element = function(section, key, value) {
		return this;
	};

	return Save;
});