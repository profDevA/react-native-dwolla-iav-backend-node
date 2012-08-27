var express = require('express');
var app = express();

// Routes
app.get('/', function(req, res) {
  res.send('Hello World!');
});

// Listen
app.listen(3000);
console.log('Listening on localhost:3000');