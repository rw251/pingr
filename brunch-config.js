module.exports = {
  // See http://brunch.io for documentation.
  paths: {
    public: 'dist',
    watched: ['src', 'vendor']
  },

  files: {
    javascripts: {
      joinTo: {
        'libraries.js': /^(?!src\/)/
      },
      order: {
        before: [
          /*'vendor/scripts/console-helper.js',
          'vendor/scripts/jquery-1.9.0.min.js',
          'vendor/scripts/handlebars-1.0.rc.2.js',
          'vendor/scripts/ember-latest.js',
          'vendor/scripts/ember-data-latest.js',*/
          'vendor/scripts/bootstrap.js'
          ]
      },
      entryPoints: {
        'src/script.js': {
          'app.js': /^src\//
        }
      }
    },
    stylesheets: {
      joinTo: 'app.css',
      order: {
        before: ['vendor/styles/bootstrap.scss']
      }
    },

    templates: {
      joinTo: 'app.js'
    }
  },

  plugins: {
    handlebars: {
      include: {
        runtime: false
      },
      pathReplace: /^.*templates\//
    }
  }
};
