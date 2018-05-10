var express = require('express'); 

var hostname = 'localhost'; 
var port = 8842; 
const http = require('https');
var app = express(); 
 
var myRouter = express.Router(); 
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bf22a3d841794ffaa63f903613dd928a');

var twitterAPI = require('node-twitter-api');
var twitter = new twitterAPI({
    consumerKey: '3xTy6ZriSI2HufxA12YpiWfc1',
    consumerSecret: 'Dayescyt7tnCnDP8xYYDAhRoymDct6sdbwYKe8qLWmeiOQ5cf5'
});
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/local";
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("local");
    // insert 
    var myobj = { nom: "chandfon", prenom: "richard", pseudo: "rchandon",email: "richard.chandon@gmail.com", abonnement: 2 };
    dbo.collection("utilisateur").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
    // update 
    var myquery = { nom: "chandon" };
    var newvalues = { $set: {nom: "Mickey"}};
    dbo.collection("utilisateur").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
    });
    // delete 
    var myquery = { nom: "Mickey" };
    dbo.collection("utilisateur").deleteOne(myquery, function(err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      db.close();
    });
  });
  
// categories : business entertainment general health science sports technology
myRouter.route('/simple-recherche/:q')
.get(function(req,res){     
    res.setHeader('Content-Type', 'application/json');
    newsapi.v2.everything({
        q: req.params.q,
        sortBy: 'relevancy'
    }).then(response => {
        console.log(response); 
        res.send({GNews : response});
    });
    twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
        if (error) {
            console.log("Error getting Auth request token : " + JSON.stringify(error));
        } else {       
            console.log(results);
            // res.send({results});
        }
    });
})
.put(function(req,res){ 
	  res.json({message : "Modification " + req.params.id_api});
})
.delete(function(req,res){ 
	  res.json({message : "Suppression" + req.params.id_api});
});

myRouter.route('/recherche-avance/:q&:category&:country&:filtre')
.get(function(req,res){ 
    if(req.params.filtre == 1){
        newsapi.v2.topHeadlines({
            category: "business",            
            category: "general",
            country: req.params.country        
        }).then(response => {
            console.log(response.articles);            
	        res.json({message : response.articles});
        });
    }else if(req.params.filtre == 2){
        newsapi.v2.everything({
            q: req.params.q,
            sortBy: 'relevancy'
          }).then(response => {
            console.log(response);
          });
    }else{

    }
})
.put(function(req,res){ 
	  res.json({message : "Modification " + req.params.id_api});
})
.delete(function(req,res){ 
	  res.json({message : "Suppression" + req.params.id_api});
});
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
        message: err.message
        }
    });
});
app.use(myRouter);  
app.listen(port, hostname, function(){
	console.log("http://"+ hostname +":"+port); 
});


// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them

// To query /v2/everything
// You must include at least one q, source, or domain


// To query sources
// All options are optional
// newsapi.v2.sources({
//   category: 'technology',
//   language: 'fr',
//   country: 'fr'
// }).then(response => {
//   console.log(response);
//   /*
//     {
//       status: "ok",
//       sources: [...]
//     }
//   */
// });