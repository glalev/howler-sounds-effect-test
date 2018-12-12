module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        options: {
          transform: [
            ['babelify', {
              // loose: 'all'
            }]
          ]
        },
        files: {
          // if the source file has an extension of es6 then
          // we change the name of the source file accordingly.
          // The result file's extension is always .js
          './app.js': ['./src/js/App.js']
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          './app.js': ['./app.js']
        }
      }
    },
    watch: {
      scripts: {
        files: 'src/js/**/*.js',
        tasks: ['browserify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('build', ['browserify', 'uglify']);
};