var path = require('path');
var express = require('express');

var app = express();

var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));

app.listen(4002, function () {
  console.log('Example app listening on port 4002!');
});
