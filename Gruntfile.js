module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          baseUrl: "js",
          mainConfigFile: "js/config.js",
          out: "build/eu4-save-viewer.min.js"
        }
      }
    }
  });

  // Load the plugin grunt-requirejs
  // See https://www.npmjs.org/package/grunt-requirejs
  grunt.loadNpmTasks('grunt-requirejs');

  // Default task(s).
  grunt.registerTask('default', ['requirejs']);

};
