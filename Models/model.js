var mongoose = require('mongoose');

var conn = mongoose.connection;
var collection = conn.collection('users');
const Schema = mongoose.Schema; 

const Users = new Schema({
	_id: Schema.ObjectId,
	tokenuser: {type: String},
	nom: { type: String },
	prenom: { type: String },
	pseudo: { type: String },
	email: { type: String, unique: true, lowercase: true  },
	verificationemail: {type: Boolean, default: false },
	password: { type: String },
	dateinscription: {type: Date},
	lastconnexion:{type: Date},
	abonnement: [],
	lang: {type: String},
	fil_actu: []
});

Users.method('insertOne', function(user, fil_actu) {
	collection.insert(user);
	let array_of_fil_actu = fil_actu.split(",");
	collection.findOneAndUpdate(
		{ email: user.email }, 
		{ $push: { fil_actu: array_of_fil_actu  } },
	   function (error, success) {
			 if (error) {
				 console.log(error);
			 } else {
				return user; 
			 }
		 });
});
  
module.exports =  mongoose.model('Users', Users)