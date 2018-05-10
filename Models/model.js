var mongoose = require('mongoose');

const Schema = mongoose.Schema; 

const Users = new Schema({
	nom: { type: String },
	prenom: { type: String },
	pseudo: { type: String },
	email: { type: String },
	password: { type: String },
	abonnement: { type: String }
});
module.exports =  mongoose.model('Users', Users)
