var express = require('express'); 
var mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
let nodeDate = require('date-and-time');
const randtoken = require('rand-token');
var Users = require('../Models/model');
var News = require('../Models/news_model');
var Playlists = require('../Models/playlist_model');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bf22a3d841794ffaa63f903613dd928a');
var conn = mongoose.connection;
var collection = conn.collection('users');
var collectionOfPlaylists = conn.collection('playlists');
const app = express.Router();
let now = nodeDate.format(new Date(), 'DD-MMMM-YYYY, hh:mm:ss');

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
        var token = randtoken.generate(16);
        let hash = bcrypt.hashSync(password);
        // bcrypt.compareSync(password, hash);
        let user = new Users({tokenuser: token,nom: nom,prenom: prenom,pseudo: pseudo,email: email,verificationemail: false,password: hash,dateinscription: now,lastconnexion: now, lang: lang});
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
                        let array_of_abonnement = abonnement.split(",") || abonnement;
                        var transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                   user: 'mxzerd@gmail.com',
                                   pass: 'ri18@ecvDigital'
                               },
                            tls: {
                                rejectUnauthorized: false
                            }
                           });
                           const mailOptions = {
                            from: "sender@email.com", // sender address
                            to: user.email, // list of receivers
                            subject: "Inscription API News Informationnelle", // Subject line
                            html: "<h1>Vérification de votre adresse email</h1><p>Bonjour "+user.nom+" "+user.prenom+",<br> Merci de cliquer sur le lien ci-dessous pour valider votre adresse email</p><a href='https://api-playlist-veille-ecv.herokuapp.com/api/email-verification?tokenuser="+user.tokenuser+"&email="+user.email+"'>Vérification adresse email</a>"// plain text body
                          };
                          transporter.sendMail(mailOptions, function (err, info) {
                            if(err)
                              console.log(err)
                            else
                              console.log(info);
                         });
                        collection.findOneAndUpdate(
                            { email: user.email }, 
                            { $push: { fil_actu: array_of_fil_actu, abonnement: array_of_abonnement } },
                            function (error, success) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    res.status(201).json({ Resultat: "New user is created : " + user.nom + " " + user.prenom+". Please check your mailbox, to active your account."}); 
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
        var queryEmail  = Users.where({email :email});
        queryEmail.findOne(function (err, result) {
            if(result){
                if(bcrypt.compareSync(password,result.password)){
                    if(result.verificationemail == true){
                        collection.findOneAndUpdate({email:result.email}, 
                            { $set: {  lastconnexion: now } },
                            {returnOriginal:false}, function(err, doc){
                            if(err){
                                console.log("Someting wrong append");
                            }
                            if(doc){
                                console.log("Your mail adresse is validate.");
                            }
                        });
                                
                    var query  = Users.where({email :email});
                    query.findOne(function (err, result) {
                        if (err) return handleError(err);
                        if (result) {
                            let allResponse= []; 
                            let allCategory = [];
                            let allNews = false;
                            let allAbonnements = [];

                            // Parcours l'array des abonnements du user, pour chaque abonnement...
                            for (var j = 0; j < result.abonnement[0].length; j++) {

                                // On récupère le pseudo de l'abonnement
                                var queryAbonnement = Users.where({pseudo :result.abonnement[0][j]});
                                
                                // On test si on trouve cet user
                                queryAbonnement.findOne(function (err, result) {
                                    if (err) return handleError(err);
                                    if (result) {
                                        // On récupère toutes les playlists de cet user et on les ajoute à l'array allAbonnements
                                        var cursor = Playlists.find({id_user :result.pseudo}).cursor();
                                        cursor.on('data', function(doc) { allAbonnements.push(doc); });
                                    }
                                });
                            }

                            for (let i = 0; i <result.fil_actu[0].length; i++) {
                                let cursor = News.find({ category: result.fil_actu[0][i]}).cursor();
                                cursor.on('data', function(doc) {
                                    // console.log("All doc "+doc.urlToImage);
                                    allResponse.push(doc);
                                });
                                cursor.on('close', function() {   
                                    if(i == result.fil_actu[0].length - 1){
                                        // allResponse.sort();
                                        // allResponse.sort(function(a, b){
                                        //     return a.publishedAt - b.publishedAt;
                                        // });
                                        res.status(200).json({ all: {
                                            User: {nom: result.nom, prenom: result.prenom, pseudo: result.pseudo,email: result.email,lastconnexion: result.lastconnexion ,dateinscription: result.dateinscription }, 
                                            abo: allAbonnements, 
                                            news: allResponse}});
                                    }
                                });
                            }

                        }
                    }); 
                }else{
                    res.status(400).json({error: "Please validate your email."});
                }
            }else{
                    res.status(400).json({ error: "Incorrect password"});
                }
            }else{
                res.status(400).json({ error: "Incorrect email"});
            }

        });
               
    });

const nodemailer = require('nodemailer');
app.route('/email-verification')
    .get((req, res)=> {
        let token = req.query["tokenuser"];
        let email = req.query["email"];
        var query = Users.where({tokenuser: token,email:email});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                if(result.verificationemail == true){                            
                    res.status(400).json({ error: "This mail adresse are aready validate !"});
                }else{
                    collection.findOneAndUpdate({tokenuser: result.tokenuser, email:result.email}, 
                        { $set: {  verificationemail: true } },
                        {returnOriginal:false}, function(err, doc){
                        if(err){
                            res.status(400).json({ error: "Someting wrong append"});
                        }
                        if(doc){
                            res.status(200).json({ Resultat: "Your mail adresse is validate."});
                        }
                    });
                }
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
        let fil_actu = req.query["fil_actu"];  
        let hash = bcrypt.hashSync(password);
        var query = { email: email};

        let array_of_abonnement = abonnement.split(",") || abonnement;
        let array_of_fil_actu = fil_actu.split(",") || fil_actu;

        collection.findOneAndUpdate(query, { $set: {
            nom: nom,
            prenom: prenom,
            pseudo: pseudo,
            password: hash,
            abonnement: array_of_abonnement,   
            fil_actu: array_of_fil_actu   
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
    var arrayOfUsers = [];
    var cursorName = Users.find({nom :user}).cursor();

    // On parcours dans la BDD tous les documents ayant comme champs nom : user
    cursorName.on('data', function(doc) { arrayOfUsers.push(doc.nom); });

    // Une fois qu'on a fini de parcourir
    cursorName.on('close', function() {
        // On vérifie qu'au moins un élément a été ajouté dans l'array de résultat...
        if (arrayOfUsers.length > 0) {
            res.status(200).json({ arrayOfUsers });
        // Sinon on effectue la même procédure pour le champs prenom
        } else {
            var cursorFirstName = Users.find({prenom :user}).cursor();
            cursorFirstName.on('data', function(doc) { arrayOfUsers.push(doc); });

            cursorFirstName.on('close', function() {
                if (arrayOfUsers.length > 0) {
                    res.status(200).json({ arrayOfUsers });
                } else {
                    // On vérifie si un pseudo correspond au pseudo saisi
                    query = Users.where({pseudo : user});
                    query.findOne(function (err, result) {
                        if (err) return handleError(err);
                        if (result) {
                            res.status(200).json({User: result});
                        }else{
                            // On vérifie si un email correspond à l'email saisi
                            query  = Users.where({email : user});
                            query.findOne(function (err, result) {
                                if (err) return handleError(err);
                                if (result) {
                                    res.status(200).json({User: result});
                                }else{                                    
                                    res.status(400).json({error: "No user found in database"});
                                }
                            })
                        }
                    });
                 }
            });
        }
    });
})

// Créer une playlist
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
        let celebritesContent = req.query["celebritesContent"] || '';
        let motsCleContent = req.query["motsCleContent"] || '';

        var playlist = new Playlists({ id_playlist: id_playlist, id_user: id_user, nom: nom, categoriesContent: categoriesContent, celebritesContent: celebritesContent, motsCleContent: motsCleContent})

        console.log('### in create')

        var query = Playlists.where({id_playlist :id_playlist});

        var list_categoriesContent = categoriesContent.split(",");
        var list_celebritesContent = celebritesContent.split(",") || '';
        var list_motsCleContent = motsCleContent.split(",") || ''; 

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

        let id_playlist = req.query["id_playlist"];
        let nom = req.query["nom"];
        let categoriesContent = req.query["categoriesContent"] || "business, entertainment, health, science, sports, technology";
        let celebritesContent = req.query["celebritesContent"] || '';
        let motsCleContent = req.query["motsCleContent"] || '';

        var list_categoriesContent = categoriesContent.split(",");
        var list_celebritesContent = celebritesContent.split(",") || '';
        var list_motsCleContent = motsCleContent.split(",") || '';

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
                res.status(500).json({ error: "Something wrong when updating data !"});
            }
            if(doc){
                res.status(200).json({ Resultat: doc});
            }
        });
    })

// Chercher une playlist à l'aide de l'id_playlist / du nom / pseudo
app.route('/playlist/search')
    .get((req, res) => {

        let id_playlist = req.query["id_playlist"] || "";
        let nom = req.query["nom"] || "";
        let pseudo = req.query["pseudo"] || "";

        var arrayPlaylistByName = [];
        var arrayPlaylistByPseudo = [];

        var query_id_playlist = Playlists.where({id_playlist : id_playlist})
        var query_nom_playlist = Playlists.where({nom : nom})
        var query_pseudo_playlist = Playlists.where({id_user : pseudo})

        // Recherche par id_playlist
        query_id_playlist.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(200).json({id_playlist: result});
            } else {
                //Recherche par nom
                if (nom !== "") {
                    var cursor = Playlists.find({nom :nom}).cursor();
                    cursor.on('data', function(doc) { arrayPlaylistByName.push(doc); });

                    cursor.on('close', function() {
                        if (arrayPlaylistByName.length > 0) {
                            res.status(200).json({ arrayPlaylistByName });
                        } else {
                            res.status(400).json({error: "No playlist with this name found in database"});
                        }
                    });
                // Recherche par pseudo
                } else {
                    var cursorPseudo = Playlists.find({id_user :pseudo}).cursor();

                    cursorPseudo.on('data', function(doc) { arrayPlaylistByPseudo.push(doc); });

                    cursorPseudo.on('close', function() {
                        if (arrayPlaylistByPseudo.length > 0) {
                            res.status(200).json({ arrayPlaylistByPseudo });
                        } else {
                            res.status(400).json({error: "No playlist with this pseudo found in database"});
                        }
                    });
                }
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
                console.log('dans remove.')            
                if (err) return res.status(500).json({ Error: "Playlist " + id_playlist + " is not deleted"});                
                res.status(200).json({ Resultat: "Playlist " + id_playlist + " deleted"});
            });
        }
        catch(e){
            res.status(400).json({error: e});
        }
    })

module.exports = app;