var express = require('express'); 
var mongoose = require('mongoose');
var Users = require('../Models/model');
var Playlists = require('../Models/playlist_model');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bf22a3d841794ffaa63f903613dd928a');
var conn = mongoose.connection;
var collection = conn.collection('users');
var collectionOfPlaylists = conn.collection('playlists');
const app = express.Router();
var now = new Date();
var day = ("0" + now.getDate()).slice(-2);
var month = ("0" + (now.getMonth() + 1)).slice(-2);
var today = now.getFullYear() + "-" + (month) + "-" + (day);

// Inscription with nom - prenom - pseudo - email - password - abonnement
// email unique / pseudo
app.route('/inscription')
    .post((req, res) => {
        let nom = req.query["nom"];
        let prenom = req.query["prenom"];  
        let pseudo = req.query["pseudo"];
        let password = req.query["password"];  
        let email = req.query["email"];
        let abonnement = req.query["abonnement"];  
        let lang = req.query["lang"];
        let fil_actu = req.query["fil_actu"]; 
        
        let user = new Users({nom: nom,prenom: prenom,pseudo: pseudo,email: email,password: password,dateinscription: today,abonnement: abonnement,lang: lang});
        // user.save();
        var query  = Users.where({email :email});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(400).json({ error: "This user email already existe"});
            } else {      
                var query  = Users.where({pseudo : pseudo});
                query.findOne(function (err, result) {
                    if (err) return handleError(err);
                    if (result) {
                        res.status(400).json({ error: "This user pseudo already existe"});
                    } else {         
                        // collection.insertOne(user,req.params.fil_actu);
                        collection.insert(user);
                        let array_of_fil_actu = fil_actu.split(",");
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
app.route('/connexion')
    .get((req, res) => {
        let email = req.query["email"];
        let password = req.query["password"];        
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
app.route('/update')
    .put((req, res) => {
        let nom = req.query["nom"];
        let prenom = req.query["prenom"];  
        let pseudo = req.query["pseudo"];
        let password = req.query["password"];  
        let email = req.query["email"];
        let abonnement = req.query["abonnement"];  

        var query = { email: email};
        collection.findOneAndUpdate(query, { $set: {  
            nom: nom,
            prenom: prenom,
            pseudo: pseudo,
            password: password,
            abonnement: abonnement   
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
app.route('/delete')
    .delete((req, res) => {
        try {  
            let email = req.query["email"];
            var query = { email: email};
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
app.route('/user/:user')
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

// Créer une playlist
app.route('/playlist/create/:id_playlist&:id_user&:nom&:categoriesContent&:celebritesContent&:motscleContent')
    .post((req, res) => {
        var playlist = new Playlists({ id_playlist: req.params.id_playlist, id_user: req.params.id_user, nom: req.params.nom, categoriesContent: req.params.categoriesContent, celebritesContent: req.params.celebritesContent, motscleContent: req.params.motscleContent})

        var query = Playlists.where({id_playlist :req.params.id_playlist});

        var array_categoriesContent = req.params.categoriesContent.split(",");
        console.log('#####', array_categoriesContent);

        query.findOne( function(err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(400).json({ error: "This id playlist is already exist"});
            } else {
                collectionOfPlaylists.insert(playlist);
                res.status(201).json({ Resultat: "New playlist create"}); 
            }
        })
    })

// Chercher une playlist à l'aide de l'id_playlist
app.route('/playlist/search/:id_playlist&:id_user&:nom&:categoriesContent&:celebritesContent&:motscleContent')
    .get((req, res) => {
        var list_categoriesContent = req.params.categoriesContent.split(",");
        var list_celebritesContent = req.params.celebritesContent.split(",");
    })

// Supprimer une playlist à l'aide de l'id_playlist
app.route('/playlist/delete/:id_playlist')
    .delete((req, res) => {
        try {
            var query = { id_playlist: req.params.id_playlist};
            
            collectionOfPlaylists.findOneAndDelete(query, function(err) {
                if (err) return res.status(500).json({ error: err});  

                res.status(200).json({ Resultat: "Playlist id : " + req.params.id_playlist + " is deleted"});
            });
        }
        catch(e){
            res.status(400).json({error: e});
        }
    })

module.exports = app;