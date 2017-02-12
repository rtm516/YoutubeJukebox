var express = require('express');
var helmet = require('helmet');
var fs = require('fs');
var errors = require("./errors.js");
var bodyParser = require('body-parser');
var request = require('request');
var htmlEncode = require('htmlencode').htmlEncode;

var config = {};

if (!fs.existsSync("./configs")) {
	fs.mkdirSync("./configs");
}

if (!fs.existsSync("./logs")) {
	fs.mkdirSync("./logs");
}

if (!fs.existsSync("./requests")) {
	fs.mkdirSync("./requests");
}

function log(message, noprefix, noprint) {
	var date = new Date();
	var prefix = "[" + ('0' + date.getDate()).slice(-2) + "/" + ('0' + date.getMonth()).slice(-2) + "/" + date.getFullYear() + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2) + "] ";
	var fullMessage = message;
	if (!noprefix) {
		fullMessage = prefix + message;
	}
	if (!noprint) {
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
	} catch (e) {
		log("Failed to load config")
	}
} else {
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
if (!("defaultPlaylist" in config)) {
	log("Default playlist missing from config (can be set to nothing)");
	hasMissing = true;
	config.defaultPlaylist = "PLx0sYbCqOb8Q_CLZC2BdBSKEEB59BOPUM";
}
if (!("defaultRandomOrder" in config)) {
	log("Default playlist random order setting missing from config");
	hasMissing = true;
	config.defaultRandomOrder = true;
}
if (!("playerControls" in config)) {
	log("Player controls setting missing from config");
	hasMissing = true;
	config.playerControls = false;
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

	files.sort(function(a, b) {
		var infoA = fs.statSync("./requests/" + a);
		var infoB = fs.statSync("./requests/" + b);
		return infoA.birthtime < infoB.birthtime ? -1 : 1;
	})

	files.forEach(file => {
		queue[file.replace(".json", "")] = JSON.parse(fs.readFileSync("./requests/" + file, 'utf8'));
	});

	return queue;
}

function isEmpty(obj) { // from https://coderwall.com/p/_g3x9q/how-to-check-if-javascript-object-is-empty
	for(var key in obj) {
		if(obj.hasOwnProperty(key))
			return false;
	}
	return true;
}


// from http://blog.corrlabs.com/2011/02/shuffling-object-properties-in.html  START//
Array.prototype.shuffle = function(){
	for (var i = 0; i < this.length; i++){
		var a = this[i];
		var b = Math.floor(Math.random() * this.length);
		this[i] = this[b];
		this[b] = a;
	}
}

function shuffleProperties(obj) {
	var new_obj = {};
	var keys = getKeys(obj);
	keys.shuffle();
	for (var key in keys){
		if (key == "shuffle") continue; // skip our prototype method
		new_obj[keys[key]] = obj[keys[key]];
	}
	return new_obj;
}

function getKeys(obj){
	var arr = new Array();
	for (var key in obj)
		arr.push(key);
	return arr;
}
// from http://blog.corrlabs.com/2011/02/shuffling-object-properties-in.html  END//

function moveToBottom(object, key) {
	var newObject = {};
	for (var i = 0; i < Object.keys(object).length; i++){
		var forKey = Object.keys(object)[i]
		if (forKey != key) {
			newObject[forKey] = object[forKey];
		}
	}
	newObject[key] = object[key];
	return newObject;
}

var playlist = {}
function generatePlaylist(callback) {
	request('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&key=' + config.youtubeAPIKey + '&playlistId=' + config.defaultPlaylist, function(error, response, body) {
		if (response.statusCode == 503) {
			callback({});
		}

		var bodyJson = JSON.parse(body);

		if (bodyJson.items) {
			var items = {};

			bodyJson.items.forEach(item => {
				items[item.snippet.resourceId.videoId] = item;
			});

			//Shuffle array if specified in config
			if (config.defaultRandomOrder) {
				items = shuffleProperties(items);
			}

			playlist = items;
			callback(items);
		} else {
			callback({});
		}
	});
}

var app = express();

//Use helmet for security
app.use(helmet());

//Allow for post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//Tell express to use ejs
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(req, res) {
	res.render('index', {
		page: "home",
		songs: getQueue()
	});
});

app.get('/playlist', function(req, res) {
	res.render('playlist', {
		page: "playlist",
		songs: getQueue()
	});
});

app.get('/search', function(req, res) {
	res.render('search', {
		page: "search"
	});
});

/*
app.get('/player', function(req, res){
	res.render('player', { page: "player" });
});
*/

app.get('/player_frame', function(req, res) {
	res.render('player_frame', {
		page: "player",
		songs: getQueue(),
		controls: config.playerControls ? 1 : 0
	});
});

app.post('/ajax/search', function(req, res) {
	var searchTerm = req.body.q;
	var sort = req.body.sort;

	var resultsJson = [];
	var errorMSG = ""

	function respond() {
		res.send({
			error: errorMSG || "",
			term: searchTerm,
			results: resultsJson
		});
	}

	if (searchTerm === "") {
		errorMSG = "Invalid search term";
		respond();
	} else if ((sort != "relevance") && (sort != "date") && (sort != "viewCount") && (sort != "rating")) {
		errorMSG = "Invalid sort order";
		respond();
	} else {
		request('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDimension=2d&videoEmbeddable=true&maxResults=25&order=' + sort + '&key=' + config.youtubeAPIKey + '&q=' + htmlEncode(searchTerm), function(error, response, body) {
			if (response.statusCode == 503) {
				errorMSG = "Youtube API down";
				respond();
			}

			var bodyJson = JSON.parse(body);

			if (bodyJson.items) {
				resultsJson = bodyJson.items;
				resultsJson.reverse();
				respond();
			} else {
				errorMSG = "No search results";
				respond();
			}
		});
	}
});

app.post('/ajax/addToQueue', function(req, res) {
	var videoId = req.body.id;
	videoId = videoId.match("([a-zA-Z0-9\-\_]+)&?");

	var resultsJson = [];
	var errorMSG = ""

	function respond() {
		res.send({
			error: errorMSG || "",
			term: videoId,
			video: resultsJson
		});
	}

	if (videoId === "") {
		errorMSG = "Invalid video id";
		respond();
	} else {
		request('https://www.googleapis.com/youtube/v3/videos?part=snippet&maxResults=1&key=' + config.youtubeAPIKey + '&id=' + videoId, function(error, response, body) {
			if (response.statusCode == 503) {
				errorMSG = "Youtube API down";
				respond();
			}

			var bodyJson = JSON.parse(body);

			if (bodyJson.items && bodyJson.items[0] && bodyJson.items[0].snippet) {
				if (fs.existsSync("./requests/" + bodyJson.items[0].id + ".json")) {
					errorMSG = "Video already requested";
					respond();
				} else {
					fs.writeFileSync("./requests/" + bodyJson.items[0].id + ".json", JSON.stringify(bodyJson.items[0], null, "\t"));
					log("Added video " + bodyJson.items[0].id + " to the queue");

					resultsJson = bodyJson.items[0].snippet;
					respond();
				}
			} else {
				errorMSG = "Invalid video id";
				respond();
			}
		});
	}
});

app.get('/ajax/getQueue', function(req, res) {
	var queue = getQueue();

	function respond(json) {
		res.send(json);
	}

	if (typeof queue == "undefined" || !queue || isEmpty(queue)) {
		if (config.defaultPlaylist != "") {
			if (typeof playlist == "undefined" || !playlist || isEmpty(playlist)) {
				generatePlaylist(respond);
			}else{
				res.send(playlist);
			}
		}else{
			res.send({});
		}
	}else{
		playlist = {};
		res.send(queue);
	}
});

app.post('/ajax/removeQueue', function(req, res) {
	var videoID = req.body.videoID;
	var type = req.body.type;

	if (type != "youtube#playlistItem") {
		var queue = getQueue();
		if (queue[videoID]) {
			if (fs.existsSync("./requests/" + videoID + ".json")) {
				try {
					fs.unlinkSync("./requests/" + videoID + ".json");
					log("Removed video " + videoID + " from the queue");
					res.send({success:1, error:""});
				}
				catch (e) {
					res.send({success:0, error:"Video in queue but file doesnt exist (probably from default playlist)"});
				}
			}else{
				res.send({success:0, error:"Video in queue but file doesnt exist (probably from default playlist)"});
			}
		}else{
			res.send({success:0, error:"That video isnt in the queue"});
		}
	}else{
		playlist = moveToBottom(playlist, videoID);
		res.send({success:1, error:""});
	}
});

//Allows for a static folder
app.use(express.static('static'));

//Start the server
log("Running webserver on *:" + config.port);
app.listen(config.port);

//Error handling
app.use(function(req, res) {
	errors.throw(404, req, res, "", log);
});
app.use(function(err, req, res, next) {
	var errorNo = (err.status || 500);
	errors.throw(errorNo, req, res, err.message, log);
});