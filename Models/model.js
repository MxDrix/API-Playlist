var mongoose = require('mongoose');
var conn = mongoose.connection;
var collection = conn.collection('utilisateur');
const Schema = mongoose.Schema; 

const Users = new Schema({
	nom: { type: String },
	prenom: { type: String },
	pseudo: { type: String },
	email: { type: String },
	password: { type: String },
	abonnement: { type: String }
});

Users.method('update', function(updates,) {
    var query = { email: updates.email};
    collection.findOneAndUpdate(query, { $set: {  
        nom: updates.nom,
        prenom: updates.prenom,
        pseudo: updates.pseudo,
        password: updates.password,
        abonnement: updates.abonnement   
    }}, {returnOriginal: false}, function(err, doc){
        if(err){
            console.log("Something wrong when updating data!");
        }
        if(doc){
            return res.status(200).send(doc);
        }
    });
  });
  
module.exports =  mongoose.model('Users', Users)
