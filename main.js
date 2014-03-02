require(["eu/save_reader"], function(save_reader) {
    // From http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-selecting-files-input
    function file_select_handler(evt) {
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

    // Check for the various File API support.
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('The File APIs are not fully supported in this browser.');
      return;
    }

    console.log("browser detected");
    document.getElementById('save_filename').addEventListener('change', file_select_handler, false);
});