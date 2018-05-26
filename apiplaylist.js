var express = require('express'); 
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser'); 
var usersRoute = require('./Routes/route');
var helmet = require('helmet');
const app = express();
const port = process.env.PORT || 5656;

const db = mongoose.connect("mongodb://ecvdigital:ecvdigital2018@ds111420.mlab.com:11420/playlistveille");

app.use(helmet());
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api', usersRoute);

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
})
app.get('*', function(req, res){
	res.status(400).json({ error: "Error, this route doesn't existe"});
});
// Running the server
app.listen(port, () => {
	console.log(`http://localhost:${port}`)
})