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
Users.method('insertOne', function(user) {
    collection.insert(user);
    return user; 
});
  
module.exports =  mongoose.model('Users', Users)
