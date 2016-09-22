var server = require('./brunch-server.js');

server(process.env.PORT || 3333,"dist", function(){
  console.log("Server listening on " + (process.env.PORT || 3333));
});

console.log("Attempting to start the server...");
