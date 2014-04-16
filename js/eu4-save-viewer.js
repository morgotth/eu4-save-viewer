// Include config to configure requirejs aliases, etc
require(["config", "eu/save_reader", "ui/drop_down_list", "eu/load_game"],
        function(config, save_reader, drop_down_list, load_game) {

    /*
     * Browser side
     */

    // From http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-selecting-files-input
    function save_selector_handler(evt) {
        var save_filepath = evt.target.files[0];

        var reader = new FileReader();
        var d = new Date().getTime();
        reader.onload = (function(file) {
            return function(e) {
                var save;

                var read_time = bench(function() {
                    save = save_reader.from_string(e.target.result);
                });

                var decode_time = bench(function() {
                    document.game = load_game(save);
                });
                //document.getElementById('save-output').innerHTML = JSON.stringify(document.game);

                console.warn(">> Read file during "+(read_time)+" seconds.")
                console.warn(">> Decode file during "+(decode_time)+" seconds.")
            }
        })(save_filepath);
        reader.readAsText(save_filepath);
    }

    function bench(callable) {
        var bench = new Date().getTime();
        callable();
        return (new Date().getTime() - bench)/1000;
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
