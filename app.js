var express = require('express');
var app = express();

// Routes
app.get('/', function(req, res) {
  res.send('Hello World!');
});

// Listen
var port = process.env.port || 3000;
app.listen(port);
console.log('Listening on localhost:'+ port);