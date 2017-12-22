module.exports = {
  // See http://brunch.io for documentation.
  paths: {
    public: 'dist',
    watched: ['app', 'vendor'],
  },

  files: {
    javascripts: {
      joinTo: {
        'libraries.js': /^(?!(app|server)\/)/,
      },
      order: {
        before: [
          /jquery/,
          'vendor/scripts/bootstrap.js',
          'vendor/scripts/jquery.dataTables.js',
          'vendor/scripts/dataTables.bootstrap.js',
          'vendor/scripts/dataTables.buttons.js',
          'vendor/scripts/buttons.bootstrap.js',
          'vendor/scripts/buttons.colVis.js',
          'vendor/scripts/buttons.html5.js',
        ],
      },
      entryPoints: {
        'app/script.js': {
          'app.js': /^app\//,
        },
        'app/justTheTracking.js': 'jtt.js',
      },
    },
    stylesheets: {
      joinTo: 'app.css',
      order: {
        before: ['vendor/styles/bootstrap.scss'],
      },
    },

    templates: {
      joinTo: 'app.js',
    },
  },
};
