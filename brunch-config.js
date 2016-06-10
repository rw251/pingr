module.exports = {
  // See http://brunch.io for documentation.
  paths: {
    public: 'dist'
  },

  files: {
    javascripts: {
      joinTo: {
        'libraries.js': /^(?!app\/)/
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
        'app/script.js': {
          'app.js': /^app\//
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

  server : {
    run: true,
    port: 3001
  }
};
