var express = require('express'); 

var hostname = 'localhost'; 
var port = 8842; 
 
var app = express(); 
 
var myRouter = express.Router(); 
 
myRouter.route('/recherche/:id_api&:theme')
.get(function(req,res){ 
	  res.json({message : "Première recherche n°" + req.params.id_api+" "+ req.params.theme});
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
 