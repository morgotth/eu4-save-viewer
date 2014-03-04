require.config({
    // Default root directory
    baseUrl: '.',
    // Bypass baseUrl for each module that begin with following paths
    paths: {
        jquery: 'libs/jquery-2.1.0'
    }
});

require(["eu/save_reader", "ui/drop_down_list"],
        function(save_reader, drop_down_list) {
    // From http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-selecting-files-input
    function save_selector_handler(evt) {
        var save_filepath = evt.target.files[0];

        var reader = new FileReader();
        reader.onload = (function(file) {
            return function(e) {
                console.log('Read '+file.name);
                var save = save_reader.from_string(e.target.result);
                document.getElementById('save_output').innerHTML = save.to_html();
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

    drop_down_list();
    main_save_reader();
});