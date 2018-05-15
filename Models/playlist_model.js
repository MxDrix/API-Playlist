var mongoose = require('mongoose');

var conn = mongoose.connection;
var collection = conn.collection('playlists');
const Schema = mongoose.Schema; 

const Playlists = new Schema({
	id_playlist: Number,
	id_user: Number,
	nom: String,
	content: [
		{
			Categories:	{
				id: { type: [String], default: [ "business", "entertainment", "health", "science", "sports", "technology"] }
			},
			Celebrites: {
				nom: [String]
			},
			MotsCle: {
				libelle: [String]
			}
		}
	]
})

module.exports =  mongoose.model('Playlists', Playlists)