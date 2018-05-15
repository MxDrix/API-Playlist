
var express = require('express'); 
var mongoose = require('mongoose');
var Users = require('../Models/model');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bf22a3d841794ffaa63f903613dd928a');
var conn = mongoose.connection;
var collection = conn.collection('users');
const usersRoute = express.Router();
var now = new Date();
var day = ("0" + now.getDate()).slice(-2);
var month = ("0" + (now.getMonth() + 1)).slice(-2);
var today = now.getFullYear() + "-" + (month) + "-" + (day);

// Inscription with nom - prenom - pseudo - email - password - abonnement
// email unique / pseudo
usersRoute.route('/inscription/:nom&:prenom&:pseudo&:email&:password&:abonnement&:lang&:fil_actu')
    .post((req, res) => {
        let user = new Users({nom: req.params.nom,prenom: req.params.prenom,pseudo: req.params.pseudo,email: req.params.email,password: req.params.password,dateinscription: today,abonnement: req.params.abonnement,lang: req.params.lang});
        // user.save();
        var query  = Users.where({email :req.params.email});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(400).json({ error: "This user email already existe"});
            }else{      
                var query  = Users.where({pseudo :req.params.pseudo});
                query.findOne(function (err, result) {
                    if (err) return handleError(err);
                    if (result) {
                        res.status(400).json({ error: "This user pseudo already existe"});
                    }else{         
                        // collection.insertOne(user,req.params.fil_actu);
                        collection.insert(user);
                        let array_of_fil_actu = req.params.fil_actu.split(",");
                        collection.findOneAndUpdate(
                            { email: user.email }, 
                            { $push: { fil_actu: array_of_fil_actu  } },
                            function (error, success) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    res.status(201).json({ Resultat: "New user create"}); 
                                }
                            }
                        );
                    }   
                });
            }
        });
    });
// Connexion with pseudo and password
usersRoute.route('/connexion')
    .get((req, res) => {
        let email = req.param("email");
        let password = req.param("password");        
        var query  = Users.where({email :email,password:password});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                console.log(result.fil_actu.length+" "+result.lang);
                let allResponse; 
                // result.fil_actu.forEach(function(element) {
                    // console.log(element);
                        res.setHeader('Content-Type', 'application/json');
                        newsapi.v2.topHeadlines({
                            category: result.fil_actu[0],
                            country: result.lang  
                        }).then(response => { 
                            newsapi.v2.topHeadlines({
                                category: result.fil_actu[1],
                                country: result.lang  
                            }).then(responsetwo => { 
                                res.status(200).json({ all:{Users: result,News: response.articles,News2: responsetwo.articles} });
                            });
                            // res.status(200).json({ all:{Users: result,News: response} });
                        });
                        
                //   });
            }else{
                res.status(400).json({ error: "Incorrect pseudo or password"});
            }
        });        
    });    
// Update user by email
usersRoute.route('/update/:email&:nom&:prenom&:pseudo&:password&:abonnement')
    .put((req, res) => {
        var query = { email: req.params.email};
        collection.findOneAndUpdate(query, { $set: {  
            nom: req.params.nom,
            prenom: req.params.prenom,
            pseudo: req.params.pseudo,
            password: req.params.password,
            abonnement: req.params.abonnement   
        }}, {returnOriginal: false}, function(err, doc){
            if(err){
                res.status(200).json({ error: "Something wrong when updating data!"});
            }
            if(doc){
                res.status(200).json({ Resultat: doc});
            }
        });
    })
// Delete user by email 
usersRoute.route('/delete/:email')
    .delete((req, res) => {
        try {
            var query = { email: req.params.email};
            // Users.deleteOne(query)
            collection.findOneAndDelete(query, function(err) {                
                if (err) return res.status(500).json({ error: err});                
                res.status(200).json({ Resultat: "User delete"});
            });
        }
        catch(e){
            res.status(400).json({error: e});
        }
    })
// Get User by nom - prenom - pseudo - email
usersRoute.route('/user/:user')
.get((req, res) => {
    var query  = Users.where({nom :req.params.user});
    query.findOne(function (err, result) {
        if (err) return handleError(err);
        if (result) {
            res.status(200).json({nom: result});
        }else{
            query  = Users.where({prenom :req.params.user});
            query.findOne(function (err, result) {
                if (err) return handleError(err);
                if (result) {
                    res.status(200).json({prenom: result});
                }else{
                    query  = Users.where({pseudo :req.params.user});
                    query.findOne(function (err, result) {
                        if (err) return handleError(err);
                        if (result) {
                            res.status(200).json({pseudo: result});
                        }else{
                            query  = Users.where({email :req.params.user});
                            query.findOne(function (err, result) {
                                if (err) return handleError(err);
                                if (result) {
                                    res.status(200).json({Resultat: result});
                                }else{                                    
                                    res.status(400).json({error: "No user found in database"});
                                }
                            })
                        }
                    })
                }
            })
        }
    });        
})    
module.exports = usersRoute;
