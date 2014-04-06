require.config({
    // Default root directory
    baseUrl: 'js',
    // Bypass baseUrl for each module that begin with following paths
    paths: {
        jquery: 'libs/jquery-2.1.0'
    }
});

require(["eu/save_reader", "ui/drop_down_list", "eu/load_game"],
        function(save_reader, drop_down_list, load_game) {

    function ul(elt) {
        return "<ul>"+elt+"</ul>";
    }
    function li(elt) {
        return "<li>"+elt+"</li>";
    }
    function section_key(elt, key) {
        return '<span class="eu-section-key">' + key + '</span>: ' + elt[key];
    }
    function array_elt(elt, key) {
        return '<li class="eu-array-elt">' + key + '</li>: ' + elt[key]
    }
    function list_key(elt, key) {
        var s = "";

        for (var size = elt[key].length, i = 0; i < size; i++) {
            var e = elt[key][i];
            s += li(e);
        };

        return '<span class="eu-list-key">' + key + '</span>:' + ul(s);
    }
    function complex_html(e, key) {
        var elt = e[key];
        for (var size = elt[key].length, i = 0; i < size; i++) {
            var e = elt[key][i];
            s += li(e);
        };
        return '<span class="eu-list-key">' + key + '</span>:' + ul(s);
    }

    function to_html(game) {
        var s = "";

        s += li(section_key(game, "start_date"));
        s += li(section_key(game, "date"));
        s += li(section_key(game, "player"));
        s += li(list_key(game, "players"));

        s += li(complex_html(game, "religions"))
        s += li(complex_html(game, "provinces"))
        s += li(complex_html(game, "countries"))
        s += li(complex_html(game, "wars"))

        return '<p>Game:</p>\n' + ul(s) + '</ul>\n'; 
    };

    /*
     * Browser side
     */

    // From http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-selecting-files-input
    function save_selector_handler(evt) {
        var save_filepath = evt.target.files[0];

        var reader = new FileReader();
        reader.onload = (function(file) {
            return function(e) {
                console.log('Read '+file.name);
                var save = save_reader.from_string(e.target.result);

                console.log('Write save '+save);
                document.game = load_game(save);
                document.getElementById('save-output').innerHTML = to_html(document.game);

                drop_down_list();//'#save-output');
            }
        })(save_filepath);
        reader.readAsText(save_filepath);
    }

    function main_save_reader() {
        // Check for the various File API support.
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
          alert('The File APIs are not fully supported in this browser.');
          return;
        }
        document.getElementById('eu_save_selector').addEventListener(
            'change', save_selector_handler, false);
    }

    function browser_main() {
        drop_down_list();
        main_save_reader();
    }

    if(require.isBrowser) {
        console.log("Browser detected");
        browser_main();
    }
});