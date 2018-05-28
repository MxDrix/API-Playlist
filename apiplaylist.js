var express = require('express'); 
var mongoose = require('mongoose'); 
var bodyParser = require('body-parser'); 
var usersRoute = require('./Routes/route');
var helmet = require('helmet');
const app = express();
const rateLimit = require('express-request-limit');
const port = process.env.PORT || 5656;

const rateLimitOpts = {
    timeout: 1000 * 60 * 30,
    exactPath: true,
    cleanUpInterval: 0,
    errStatusCode: 429,
    errMessage: 'Vous avez effectué trop d\'appel sur l\'API.'
}

app.get('/api/playlist/create', rateLimit(rateLimitOpts), (req, res) => {
    res.send('Requête refusée !');
});

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
	res.status(400).json({ error: "This route doesn't existe"});
});
// Running the server
app.listen(port, () => {
	console.log(`http://localhost:${port}`)
})