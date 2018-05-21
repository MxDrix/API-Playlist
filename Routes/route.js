var express = require('express'); 
var mongoose = require('mongoose');
var Users = require('../Models/model');
var News = require('../Models/news_model');
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
                let allResponse= []; 
                let allCategory = [];
                let allNews = false;
                console.log(result.fil_actu);
                    for (let i = 0; i <result.fil_actu[0].length; i++){                            
                        console.log(result.fil_actu[0][i]);
                        let cursor = News.find({ category: result.fil_actu[0][i]}).cursor();
                        cursor.on('data', function(doc) {
                            allResponse.push(doc);
                        });
                        cursor.on('close', function() {   
                            if(i == result.fil_actu[0].length - 1){
                                allResponse.sort();
                                allResponse.sort(function(a, b){
                                    return a.publishedAt - b.publishedAt;
                                });
                                res.setHeader('Cache-Control', 'public, max-age=31557600');
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ all: {User: result, news: allResponse}});
                            }
                        });
                    }
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
app.route('/user')
.get((req, res) => {
    let user = req.query["user"];
    var query  = Users.where({nom : user});
    query.findOne(function (err, result) {
        if (err) return handleError(err);
        if (result) {
            res.status(200).json({nom: result});
        }else{
            query  = Users.where({prenom : user});
            query.findOne(function (err, result) {
                if (err) return handleError(err);
                if (result) {
                    res.status(200).json({prenom: result});
                }else{
                    query  = Users.where({pseudo : user});
                    query.findOne(function (err, result) {
                        if (err) return handleError(err);
                        if (result) {
                            res.status(200).json({pseudo: result});
                        }else{
                            query  = Users.where({email : user});
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
// Ex : http://localhost:5656/api/playlist/create?motsCleContent=tesla,psg,info&id_playlist=32&id_user=4&celebritesContent=ElonMusk,ChrisBrown,Neymar&nom=MyPlaylist&categoriesContent=Sports
app.route('/playlist/create')
    .post((req, res) => {

        var object_content = {
            Categories: {
                id: []
            },
            Celebrites: {
                nom: []
            },
            MotsCle: {
                libelle: []
            }
        };

        let id_playlist = req.query["id_playlist"];
        let id_user = req.query["id_user"];
        let nom = req.query["nom"];
        let categoriesContent = req.query["categoriesContent"];
        let celebritesContent = req.query["celebritesContent"];
        let motsCleContent = req.query["motsCleContent"];

        var playlist = new Playlists({ id_playlist: id_playlist, id_user: id_user, nom: nom, categoriesContent: categoriesContent, celebritesContent: celebritesContent, motsCleContent: motsCleContent})

        var query = Playlists.where({id_playlist :id_playlist});

        var list_categoriesContent = categoriesContent.split(",");
        var list_celebritesContent = celebritesContent.split(",");
        var list_motsCleContent = motsCleContent.split(","); 

        object_content.Categories.id = list_categoriesContent;
        object_content.Celebrites.nom = list_celebritesContent;
        object_content.MotsCle.libelle = list_motsCleContent;

        query.findOne( function(err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(400).json({ error: "This id playlist is already exist"});
            } else {
                collectionOfPlaylists.insert(playlist);
                collectionOfPlaylists.findOneAndUpdate(
                    { id_playlist: playlist.id_playlist },
                    { $push: { content: object_content } },
                    function (error, success) {
                        if (error) {
                            console.log(error);
                        } else {
                            res.status(201).json({ Resultat: "New Playlist : " + playlist.nom + " is created"}); 
                        }
                    }
                )
            }
        })
    })

// Update a playlist by id_playlist
app.route('/playlist/update')
    .put((req, res) => {

        var array_of_object = [];
        var object_content = {
            Categories: {
                id: []
            },
            Celebrites: {
                nom: []
            },
            MotsCle: {
                libelle: []
            }
        };

        let defaultCategories;
        let id_playlist = req.query["id_playlist"];
        let nom = req.query["nom"];
        let categoriesContent = req.query["categoriesContent"] || "business, entertainment, health, science, sports, technology";
        let celebritesContent = req.query["celebritesContent"];
        let motsCleContent = req.query["motsCleContent"];

        var list_categoriesContent = categoriesContent.split(",");
        var list_celebritesContent = celebritesContent.split(",");
        var list_motsCleContent = motsCleContent.split(",");

        object_content.Categories.id = list_categoriesContent;
        object_content.Celebrites.nom = list_celebritesContent;
        object_content.MotsCle.libelle = list_motsCleContent;

        var query = { id_playlist: id_playlist };

        array_of_object.push(object_content);

        Playlists.findOneAndUpdate(query, { $set: {  
            nom: nom,
            content: array_of_object,
        }}, {returnOriginal: false}, function(err, doc) {
            if(err){
                res.status(500).json({ error: "Something wrong when updating data!"});
            }
            if(doc){
                res.status(200).json({ Resultat: doc});
            }
        });
    })

// Chercher une playlist à l'aide de l'id_playlist et/ou du nom
app.route('/playlist/search')
    .get((req, res) => {

        let id_playlist = req.query["id_playlist"] || "";
        let nom = req.query["nom"] || "";

        var query_id_playlist = Playlists.where({id_playlist : id_playlist})
        var query_nom_playlist = Playlists.where({nom : nom})

        query_id_playlist.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(200).json({id_playlist: result});
            } else {
                query_nom_playlist.findOne(function (err, result) {
                    if (err) return handleError(err);
                    if (result) {
                        res.status(200).json({nom: result});
                    } else {
                        res.status(400).json({error: "No playlist found in database"});
                    }
                })
            }
        })
    })


// Supprimer une playlist à l'aide de l'id_playlist
app.route('/playlist/delete')
    .delete((req, res) => {
        try {
            let id_playlist = req.query["id_playlist"];

            var query_id_playlist = {id_playlist: id_playlist};
            
            Playlists.remove(query_id_playlist, function(err) {                
                if (err) return res.status(500).json({ error: err});                
                res.status(200).json({ Resultat: "Playlist " + id_playlist + " delete"});
            });

        }
        catch(e){
            res.status(400).json({error: e});
        }
    })

module.exports = app;