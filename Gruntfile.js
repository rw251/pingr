module.exports = function(grunt) {
	grunt.initConfig({
		'jshint': {
			all: ['*.js', '*.json', 'assets/js/app/custom.js']
		},
		'watch': {
			files: ['*.js', '*.json', 'assets/js/app/custom.js'],
			tasks: ['jshint']
		},
		'http-server': {
	 
			'dev': {
				root: ".",
				port: 8282,
				host: "0.0.0.0",
	 
				cache: 10, //seconds
				showDir : true,
				autoIndex: true,
	 
				// server default file extension 
				ext: "html",
	 
				// run in parallel with other tasks 
				runInBackground: true	 
			}
	 
		}
	});
	 
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-http-server');

	// Default task(s).
	grunt.registerTask('default', ['jshint','http-server','watch']);
};