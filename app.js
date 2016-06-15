var server = require('./brunch-server.js');

server(3333,"dist", function(){
  console.log("Server listening on 3333");
});

console.log("Attempting to start the server...");
