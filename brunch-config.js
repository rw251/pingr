module.exports = {
  // See http://brunch.io for documentation.
  paths: {
    public: 'dist',
    watched: ['app','vendor','server']
  },

  files: {
    javascripts: {
      joinTo: {
        'libraries.js': /^(?!(app|server)\/)/
      },
      order: {
        before: [
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
  hooks: {
    onCompile: function(generatedFiles, changedAssets) {
      if(changedAssets.length === changedAssets.filter(function(v){
        return v.path.search(/^server/);
      }).length) {
          console.log("NEED TO RESTART");
      }
    }
  }
  /*,

  server : {
    run: true,
    port: 3333
  }*/
};
