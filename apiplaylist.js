var express = require('express'); 
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser'); 
var usersRoute = require('./Routes/route');
var path = require('path');
const app = express();
const port = process.env.PORT || 5656;
// Connecting to the database
const db = mongoose.connect("mongodb://ecvdigital:ecvdigital2018@ds111420.mlab.com:11420/playlistveille");

// setting body parser middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api', usersRoute);

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
})

// Running the server
app.listen(port, () => {
	console.log(`http://localhost:${port}`)
})