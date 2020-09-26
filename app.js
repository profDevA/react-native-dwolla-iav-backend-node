const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const dwolla = require('dwolla-v2');
const app = express();
const path = require('path');
let appState = {};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('public'));

// Dwolla part
// Navigate to https://dashboard.dwolla.com/applications (production) or https://dashboard-sandbox.dwolla.com/applications (Sandbox) for your application key and secret.
const appKey = 'NYYNpKdWcjeM7vZ60wWlBqKyhb520rjTERp3dtNvjdF7OyZVxo';
const appSecret = 'qiP56t69t1TJ2ISAxuQPrUkXYgUaI6FRzrwvYvB3wsD2LIjLo0';
const client = new dwolla.Client({
  key: appKey,
  secret: appSecret,
  environment: 'sandbox' // optional - defaults to production
});


// create a token and retrieve customers
// Get customer info 
app.post('/getcustomerinfo', (req, resp) => {
  client.auth.client()
    .then(appToken => {
      appToken
        .get('customers', { email: req.body.email })
        .then(res => {
          console.log(res.body._embedded['customers'][0])
          if (res.body._embedded['customers'].length == 1) {
            resp.send({
              error: false,
              customerId: res.body._embedded['customers'][0].id,
              firstName: res.body._embedded['customers'][0].firstName,
              lastName: res.body._embedded['customers'][0].lastName,
            })
            console.log(appState, 'appstate');
          } else {
            resp.send({
              error: true,
              message: "This is not our customer"
            })
          }
        });
    })
})

app.post('/createiavtoken', (req, res) => {
  let customerUrl = 'https://api-sandbox.dwolla.com/customers/' + req.body.customerId;
  // create a iav token
  client.auth.client()
    .then(appToken =>
      appToken.post(`${customerUrl}/iav-token`))
    .then(result => {
      appState.iavToken = result.body.token;
      res.send({ iavToken: result.body.token })
      console.log('iav tocken', result.body.token)
    });
})

app.get('/getiavtoken', (req, res) => {
  console.log('Get IAV token request')
  res.send({ iavToken: appState.iavToken })
})


var requestBody = {
  firstName: "John",
  lastName: "Doe",
  email: "jdoe@nomail.net",
  type: "personal",
  address1: "99-99 33rd St",
  city: "Some City",
  state: "NY",
  postalCode: "11101",
  dateOfBirth: "1970-01-01",
  // For the first attempt, only the
  // last 4 digits of SSN required
  // If the entire SSN is provided,
  // it will still be accepted
  ssn: "1234",
};

client.auth.client()
  .then(appToken =>
    appToken
      .post("customers", requestBody)
      .then((res) => res.headers.get("location")) // => 'https://api-sandbox.dwolla.com/customers/FC451A7A-AE30-4404-AB95-E3553FCD733F'
  );



// Routes
app.get('/', function (req, res) {
  // res.sendFile(about.html);
  // res.sendFile('public/about.html', {root: __dirname})
  res.sendFile(path.join(__dirname + '/index.html'));
});


// Listen
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on localhost:' + port);