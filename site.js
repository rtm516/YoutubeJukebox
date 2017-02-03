var express = require('express');
var helmet = require('helmet');
var fs = require('fs');
var errors = require("./errors.js");
var bodyParser = require('body-parser');
var request = require('request');

var config = {};

if (!fs.existsSync("./configs")){
	fs.mkdirSync("./configs");
}

if (!fs.existsSync("./logs")){
	fs.mkdirSync("./logs");
}

if (!fs.existsSync("./requests")){
	fs.mkdirSync("./requests");
}

function log(message, noprefix, noprint) {
	var date = new Date();
	var prefix = "[" + ('0' + date.getDate()).slice(-2) + "/" + ('0' + date.getMonth()).slice(-2) + "/" + date.getFullYear() + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2) + "] ";
	var fullMessage = message;
	if (!noprefix){
		fullMessage = prefix + message;
	}
	if (!noprint){
		console.log(fullMessage);
	}
	fs.appendFile("./logs/" + ('0' + date.getDate()).slice(-2) + "-" + ('0' + date.getMonth()).slice(-2) + "-" + date.getFullYear() + ".txt", fullMessage + "\n");
}

log("\n\n\n\n", true, true);

log("Loading config file");
if (fs.existsSync('./configs/config.json')) {
	try {
		config = JSON.parse(fs.readFileSync('./configs/config.json', 'utf8'));
		log("Loaded config file");
	}catch (e) {
		log("Failed to load config")
	}
}else{
	log("No config found!")
}

log("Checking config for correct values")
var hasMissing = false;
if (!("port" in config)) {
	log("Server port missing from config");
	hasMissing = true;
	config.port = 3000;
}
if (!("youtubeAPIKey" in config)) {
	log("Youtube API key missing from config");
	hasMissing = true;
	config.youtubeAPIKey = "youtube api key here";
}

function saveConfig() {
	log("Saving config");
	fs.writeFileSync('./configs/config.json', JSON.stringify(config, null, "\t"));
}

if (hasMissing === true) {
	log("Closing, please correct config");
	saveConfig();
	process.exit();
}

function getQueue() {
	var queue = {};
	var files = fs.readdirSync("./requests/");
	
	files.forEach(file => {
		queue[file.replace(".json", "")] = JSON.parse(fs.readFileSync("./requests/" + file, 'utf8'));
	});
	
	return queue;
}

var app = express();

//Security stuff
app.use(helmet());

//Allow for post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Tell express to use ejs
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(req, res){
	res.render('index', { page: "home", songs: getQueue() });
});

app.get('/player', function(req, res){
	res.render('player', { page: "player" });
});

app.get('/player_frame', function(req, res){
	res.render('player_frame', { page: "player", songs: getQueue() });
});

app.post('/ajax/search', function(req, res){
	var searchTerm = req.body.q;
	var sort = req.body.sort;
	
	var resultsJson = [];
	var errorMSG = ""

	function respond() {
		res.send({error: errorMSG || "", term: searchTerm, results: resultsJson});
	}

	if (searchTerm == "") {
		errorMSG = "Invalid search term";
		respond();
	}else if ((sort != "relevance") && (sort != "date") && (sort != "viewCount") && (sort != "rating")) {
		errorMSG = "Invalid sort order";
		respond();
	}else{
		request('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDimension=2d&videoEmbeddable=true&maxResults=25&order=' + sort + '&key=' + config.youtubeAPIKey + '&q=' + searchTerm, function (error, response, body) {
			if (response.statusCode == 503) {
				errorMSG = "Youtube API down";
				respond();
			}

			var bodyJson = JSON.parse(body);

			if (bodyJson["items"]) {
				resultsJson = bodyJson["items"]
				respond();
			}else{
				errorMSG = "No search results";
				respond();
			}
		});
	}
});

app.post('/ajax/addToQueue', function(req, res){
	var videoId = req.body.id;
	videoId = videoId.match("([a-zA-Z0-9\-\_]+)&?");
	
	var resultsJson = [];
	var errorMSG = ""

	function respond() {
		res.send({error: errorMSG || "", term: videoId, video: resultsJson});
	}

	if (videoId == "") {
		errorMSG = "Invalid video id";
		respond();
	}else{
		request('https://www.googleapis.com/youtube/v3/videos?part=snippet&maxResults=1&key=' + config.youtubeAPIKey + '&id=' + videoId, function (error, response, body) {
			if (response.statusCode == 503) {
				errorMSG = "Youtube API down";
				respond();
			}

			var bodyJson = JSON.parse(body);

			if (bodyJson["items"] && bodyJson["items"][0] && bodyJson["items"][0]["snippet"]) {
				if (fs.existsSync("./requests/" + bodyJson["items"][0]["id"] + ".json")) {
					errorMSG = "Video already requested";
					respond();
				}else{
					fs.writeFileSync("./requests/" + bodyJson["items"][0]["id"] + ".json", JSON.stringify(bodyJson["items"][0], null, "\t"));

					resultsJson = bodyJson["items"][0]["snippet"]
					respond();
				}				
			}else{
				errorMSG = "Invalid video id";
				respond();
			}
		});
	}
});


//Allows for a static folder
app.use(express.static('static'));

//Use helmet for security
app.use(helmet());

//Start the server
log("Running webserver on *:" + config.port);
app.listen(config.port);

//Error handling
app.use(function (req, res) {
	errors.throw(404, req, res, "", log);
});
app.use(function (err, req, res, next) {
	var errorNo = (err.status || 500);
	errors.throw(errorNo, req, res, err.message, log);
});