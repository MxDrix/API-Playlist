var mongoose = require('mongoose');
var conn = mongoose.connection;
var collection = conn.collection('users');
const Schema = mongoose.Schema; 

const Users = new Schema({
	_id: Schema.ObjectId,
	tokenuser: { type: String },
	nom: { type: String },
	prenom: { type: String },
	pseudo: { type: String },
	email: { type: String, unique: true, lowercase: true },
	verificationemail: {type: Boolean, default: false },
	password: { type: String, select: false },
	dateinscription: { type: Date },
	lastconnexion:{ type: Date },
	abonnement: [],
	lang: { type: String },
	fil_actu: []
});
 
module.exports =  mongoose.model('Users', Users)