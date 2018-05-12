var mongoose = require('mongoose');

var conn = mongoose.connection;
var collection = conn.collection('users');
const Schema = mongoose.Schema; 

const Users = new Schema({
	nom: { type: String },
	prenom: { type: String },
	pseudo: { type: String },
	email: { type: String },
	password: { type: String },
	abonnement: { type: String }
});

const Categories = new Schema({
	id: { type: String, default: [ "business", "entertainment", "health", "science", "sports", "technology"] }
})

const Sources = new Schema({
	id: String,
	nom: String
})

const Celebrites = new Schema({
	nom: String
})

const MotsCle = new Schema({
	libelle: String
})

const Playlists = new Schema({
	id_playlist: Number,
	id_user: Number,
	nom: String,
	content: [
		{
			Categories: {
				id: String
			},
			Sources: {
				id: String,
				nom: String
			},
			Celebrites: {
				nom: String
			},
			MotsCle: {
				libelle: String
			}
		}
	]
})

Users.method('insertOne', function(user) {
    collection.insert(user);
    return user; 
});
  
module.exports =  mongoose.model('Users', Users)
