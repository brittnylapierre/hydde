/*
 * Server for Hydde.io
 * Brittny Lapierre
*/


/*----------------CONFIGURE----------------*/

const express = require('express');
const app = express();
var session = require('express-session');
var url = require('url');
var qs = require('querystring');
var github = require('octonode');
var cors = require('cors');
var jwt = require('express-jwt');
var Client = require('node-rest-client').Client;
var client = new Client();

var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var config = require('./config'); // get our config file

// If an incoming request uses
// a protocol other than HTTPS,
// redirect that request to the
// same url but with HTTPS
const forceSSL = function() {
  return function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(
       ['https://', req.get('Host'), req.url].join('')
      );
    }
    next();
  }
}

// Instruct the app
// to use the forceSSL
// middleware
app.use(forceSSL());

// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist'));

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Sessions for our users
app.use(session({resave: true, saveUninitialized: true, secret: config.secret, cookie: { maxAge: 60000 }}));

// Build the authorization config and url
var auth_url = github.auth.config({
    id: config.CLIENT_ID,
    secret: config.CLIENT_SECRET
  }).login(['user', 'repo', 'gist']); //scope

// Store info to verify against CSRF
var state = auth_url.match(/&state=([0-9a-z]{32})/i); //security



/*----------------DATABASE----------------*/

app.get('/mongo', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});



/*----------------GITHUB API----------------*/

// Build the authorization config and url
var auth_url = github.auth.config({
    id: config.CLIENT_ID,
    secret: config.CLIENT_SECRET
  }).login(['user', 'repo', 'gist']); //scope

// Store info to verify against CSRF
var state = auth_url.match(/&state=([0-9a-z]{32})/i); //security


app.get('/login',function(req,res){
  console.log('in login');
  res.set('Content-Type','application/json');//Access control
  res.send({"red_location" : auth_url});
  res.end('Redirecting to ' + auth_url);
});


app.get('/auth',function(req,res){
  var uri = url.parse(req.url);
  var values = qs.parse(uri.query);
  // Check against CSRF attacks
  if (!state || state[1] != values.state) {
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('');
  } 
  else {
    console.log('in auth');
    github.auth.login(values.code, function (err, token) {
      //res.writeHead(200, {'Content-Type': 'text/plain'});
      //res.end(token);
      //user_token = token;
      req.session.token = token;
      //res.redirect('/dashboard');
      res.sendFile(path.join(__dirname + '/dist/index.html'));
    });
  }
});



/*----------------ANGULAR2 ROUTE----------------*/

// For all other GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});



/*----------------LISTEN----------------*/

// Start the app by listening on the default
// Heroku port
app.listen(process.env.PORT || 8080);


/*----------------Client Examples----------------*/
/*
GET
// direct way 
client.get("http://remote.site/rest/xml/method", function (data, response) {
    // parsed response body as js object 
    console.log(data);
    // raw response 
    console.log(response);
});


// set content-type header and data as json in args parameter 
var args = {
    data: { test: "hello" },
    headers: { "Content-Type": "application/json" }
};
 
client.post("http://remote.site/rest/xml/method", args, function (data, response) {
    // parsed response body as js object 
    console.log(data);
    // raw response 
    console.log(response);
});

*/

//DASHBOARD
/*if(!req.session.user || !req.session.user_url || !req.session.html_url){
var args = {
  headers: { 
    "Authorization": "token " + req.session.token, 
    'user-agent': 'node.js'
  }
};

client.get("https://api.github.com/user", args, function (data, response) {
  // parsed response body as js object 
  console.log(data);
  req.session.user = data.login;
  req.session.user_url = data.url;
  req.session.html_url = data.html_url;
});
}*/