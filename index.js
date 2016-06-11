//TASKS:
//1. provision a db for storing events (?)
//2. make fb access work for graphAPIexplorer scope (done)
//3. make fb access work for Meet scope (done)
//4. make the route guide on the page (done)
//5. make the front page for this app (done)
//6. Error handling and developer proofing (?)
//7. SQL injection proofing if needed (?)

var express = require('express');
var app = express();
var cool = require('cool-ascii-faces');
var request = require('superagent');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Crypto = require("crypto-js");
var unirest = require('unirest');

var jwt = require('jsonwebtoken');
var config = require('./config'); //gt out config file
var User = require('./models/user'); //get our mongoose model

mongoose.connect(config.database); //connect to db
app.set('superSecret', config.secret); //secret variable 
var meetAPP_ID = 1016247148423251;

//use body parser so that we can get info from POST and/or URL params
app.use(bodyParser.urlencoded({extended: false}));

var APP_SECRET = '901271404bee861b0810763d5d4ca8d4';


app.set('port', (process.env.PORT || 5000));

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)

// TODO: route middleware to verify a token


app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });


app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

//test the database
app.get('/api/setup', function(req, res) {

  // create a sample user
  var nick = new User({ 
    name: 'Cara Khajavi', 
    password: 'password',
    admin: true 
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});

apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          //expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

//returns the number of mutual friends
app.get('/api/amf/:access_token/:friend_id',function(request,response){
	var access_token = request.params.access_token;
	var friend_id  = request.params.friend_id;
	var app_proof = Crypto.HmacSHA256(access_token, APP_SECRET);

	var hexproof = app_proof.toString(Crypto.enc.Hex);
	var url = "https://graph.facebook.com/"+ friend_id + "?" + "fields=name,picture,context.fields(mutual_friends,mutual_likes)&access_token=" + access_token + "&appsecret_proof=" + hexproof;
	unirest.get(url)
		.end(function (res) {
		var jresponse = JSON.parse(res.body);
		// console.log(jresponse['picture']['data']['url'])//["context"])
		// response.send(jresponse);
		if (jresponse['context'] !== undefined && jresponse["context"]["mutual_friends"]!== undefined){
			my_response = {
							"name": jresponse['name'],
							"picture":jresponse['picture']['data']['url'],
							"mutual_friends":jresponse["context"]["mutual_friends"]["summary"]["total_count"],
							"mutual_likes":jresponse["context"]["mutual_likes"]["summary"]["total_count"],
              "app_scoped_id" : friend_id,
						};

			response.send(my_response);
		  	
  		}
  		else{
  			response.send(jresponse);
  		}	
	});	

});

//returns the number of mutual likes
app.get('/api/aml/:access_token/:friend_id',function(request,response){
	var access_token = request.params.access_token;
	var friend_id  = request.params.friend_id;
	var app_proof = Crypto.HmacSHA256(access_token, APP_SECRET);

	var hexproof = app_proof.toString(Crypto.enc.Hex);
	var url = "https://graph.facebook.com/"+ friend_id + "?" + "fields=context.fields(mutual_likes)&access_token=" + access_token + "&appsecret_proof=" + hexproof;
	unirest.get(url)
		.end(function (res) {
		var jresponse = JSON.parse(res.body);
		console.log(jresponse["context"])
		if (jresponse['context'] !== undefined && jresponse["context"]["mutual_likes"]!== undefined){
  			response.send(jresponse["context"]["mutual_likes"]["summary"]);
  		}
  		else{
  			response.send(jresponse);
  		}  	
	});	

});

app.get('/fb/:access_token/:app_scoped_queryid',function(request,response){
	
	var token = request.params.access_token;
	var queryid = request.params.app_scoped_queryid;

	var query = "https://graph.facebook.com/"+queryid;
	var request = require('superagent');
	request
		.get(query)
		.query({fields: 'context.fields(mutual_likes,mutual_friends)'})
		.query({access_token: token})
		.end(function(err,res){
			if(!err && res.status===200){
				var res = res.text;
				response.json(JSON.parse(res));
			}
		});
});

app.get('/fbx/:access_token/:app_scoped_queryid',function(request,response){
	
	var token = request.params.access_token;
	var queryid = request.params.app_scoped_queryid;

	var query = "https://graph.facebook.com/"+queryid;
	var request = require('superagent');
	request
		.get(query)
		.query({fields: 'context.fields(mutual_likes,mutual_friends),name'})
		.query({access_token: token})
		.end(function(err,res){
			if(!err && res.status===200){
				var res = res.text;
				response.send("['"+JSON.parse(res).name+"','"+JSON.parse(res).context.mutual_likes.summary.total_count + "',' "+ JSON.parse(res).context.mutual_friends.summary.total_count+"']");
			}
		});
});






//TO:DO
//our app is different: we dont remember friends rather we remember events or connections.
//every meeting (read: an event ) between two people will carry an id
//This id is same as the facebook user-context-id between two people 
//which when queried contains all the information pertaining to the two people
//we will maintain our database with information with this user-context-id as the key.
app.get('fb/event/:edgeid/:access_token',function(request,response){
	response.send('event search...coming soon');
});

//TO:DO
//app route info
app.get('/info',function(request,response){
	response.send('info about routes...coming soon');
});


//test routes begin
app.get('/times', function
	(request,response){
 var string = '';
 for(var i = 0; i<= process.env.TIMES; i++){
    string += i + ' ';
  }
 response.send(string);
});


app.get('/cool',function(request,response){
  response.send(cool());
});
//test routes end

app.listen(app.get('port'), function() {
  console.log('Meet sServer is running on port', app.get('port'));
});
