var express = require('express');
var helmet = require('helmet');
var fs = require('fs');
var errors = require("./errors.js");
var bodyParser = require('body-parser');

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
	log("Server port key missing from config");
	hasMissing = true;
	config.port = 3000;
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
	res.render('index', { page: "home" });
});

app.get('/player', function(req, res){
	res.render('player', { page: "player" });
});

app.get('/player_frame', function(req, res){
	var files = {}
	
	res.render('player_frame', { page: "player", songs: files });
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