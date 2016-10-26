var server = require('./brunch-server.js');

server(process.env.PORT || 4002,"dist", function(){
  console.log("Server listening on " + (process.env.PORT || 4002));
});

console.log("Attempting to start the server...");
