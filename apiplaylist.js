var express = require('express'); 
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser'); 
var APIRoutes = require('./Routes/route');
var helmet = require('helmet');
const app = express();
var RateLimit = require('express-rate-limit');
const port = process.env.PORT || 5656;

// Connecting to mongodb database
var dbuser = 'ecvdigital';
var dbpassword = 'ecvdigital2018';
const db = mongoose.connect("mongodb://" + dbuser + ":" + dbpassword + "@ds111420.mlab.com:11420/playlistveille");

// Bloque le nombre de requêtes max sur toutes les routes
app.enable('trust proxy');

var limiter = new RateLimit({
	windowMs: 15*60*1000, // 15 minutes
	max: 20, // limit each IP to 100 requests per windowMs
	delayMs: 0, // disable delaying - full speed until the max limit is reached
	message: "Vous avez effectué trop de requêtes sur l\'API. Veuillez réessayez plus tard."
});

// app.use(limiter);

app.use(helmet());
app.disable('x-powered-by');
app.use(cacheControl({
  noCache: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use('/api', APIRoutes);

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
})
app.get('*', function(req, res){
	res.status(400).json({ error: "This route doesn't existe"});
});
// Running the server
app.listen(port, () => {
	console.log(`http://localhost:${port}`)
})