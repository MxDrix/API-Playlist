var express = require('express'); 

var hostname = 'localhost'; 
var port = 8842; 
const http = require('https');
var app = express(); 
 
var myRouter = express.Router(); 
// const request = require("request");
const API_TOKEN = "bf22a3d841794ffaa63f903613dd928a"

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bf22a3d841794ffaa63f903613dd928a');
// categories : business entertainment general health science sports technology
myRouter.route('/simple-recherche/:q&:filtre')
.get(function(req,res){ 
    if(req.params.filtre == 1){
        newsapi.v2.everything({
            q: req.params.q,
            language: req.params.lang,
            sortBy: 'relevancy'
        }).then(response => {
            console.log(response);
        });
    }
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
            q: req.params.q,
            category: req.params.category,
            country: req.params.country        
        }).then(response => {
            console.log(response);            
	        res.json({message : ""+ JSON.stringify(response)});
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