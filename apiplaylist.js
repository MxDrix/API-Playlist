var express = require('express'); 

var hostname = 'localhost'; 
var port = 8842; 
 
var app = express(); 
 
var myRouter = express.Router(); 
 
myRouter.route('/recherche/:id_api&:theme')
.get(function(req,res){ 
	  res.json({message : "Vous souhaitez accéder aux informations de la piscine n°" + req.params.id_api+" "+ req.params.theme});
})
.put(function(req,res){ 
	  res.json({message : "Vous souhaitez modifier les informations de la piscine n°" + req.params.piscine_id});
})
.delete(function(req,res){ 
	  res.json({message : "Vous souhaitez supprimer la piscine n°" + req.params.piscine_id});
});
app.use(myRouter);  
 
app.listen(port, hostname, function(){
	console.log("http://"+ hostname +":"+port); 
});
 