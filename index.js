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
var meetAPP_ID = 1016247148423251;
var Crypto = require("crypto-js");
//var middleWare = require('./middleWare.js');
var unirest = require('unirest');
var APP_SECRET = '901271404bee861b0810763d5d4ca8d4';


app.set('port', (process.env.PORT || 5000));

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

app.get('/api/amf/:access_token/:friend_id',function(request,response){
	var access_token = request.params.access_token;
	var friend_id  = request.params.friend_id;
	var app_proof = Crypto.HmacSHA256(access_token, APP_SECRET);

	var hexproof = app_proof.toString(Crypto.enc.Hex);
	var url = "https://graph.facebook.com/"+ friend_id + "?" + "fields=context.fields(mutual_friends)&access_token=" + access_token + "&appsecret_proof=" + hexproof;
	unirest.get(url)
		.end(function (res) {
		var jresponse = JSON.parse(res.body);
		console.log(jresponse["context"])
		if (jresponse['context'] !== undefined && jresponse["context"]["mutual_friends"]!== undefined){
  			response.send(jresponse["context"]["mutual_friends"]["summary"]);
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