module.exports = {
  // See http://brunch.io for documentation.
  paths: {
    public: 'dist',
    watched: ['src']
  },

  files: {
    javascripts: {
      joinTo: {
        'libraries.js': /^(?!src\/)/
      },
      entryPoints:{
        'src/script.js' : {
          'app.js': /^src\//
        }
      }
    },
    stylesheets: { joinTo: 'app.css' },
    templates: { joinTo: 'app.js' }
  }
};
