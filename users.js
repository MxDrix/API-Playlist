var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/local";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("local");
  var myobj = { nom: "chandon", prenom: "richard", pseudo: "rchandon",email: "richard.chandon@gmail.com", abonnement: 2 };
  dbo.collection("utilisateur").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});

