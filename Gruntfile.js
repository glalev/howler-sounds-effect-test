module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        options: {
          watch: true,
          transform: [
            ['hbsfy', {'extensions': ['hbs']}],
            ['babelify', {presets: ['@babel/preset-env'], plugins: []}],
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
        files: ['src/js/**/*.js', 'src/templates/*.hbs'],
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