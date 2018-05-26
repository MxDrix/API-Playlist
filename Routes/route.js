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
const bcrypt = require('bcrypt-nodejs');

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
        let hash = bcrypt.hashSync(password);
        bcrypt.compareSync(password, hash);
        let user = new Users({nom: nom,prenom: prenom,pseudo: pseudo,email: email,password: hash,dateinscription: today, lang: lang});
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
                        let array_of_abonnement = abonnement.split(",");

                        collection.findOneAndUpdate(
                            { email: user.email }, 
                            { $push: { fil_actu: array_of_fil_actu, abonnement: array_of_abonnement } },
                            function (error, success) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    res.status(201).json({ Resultat: "New user is created : " + user.nom + ' ' + user.prenom}); 
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
                                    allResponse.push(doc);
                                });
                                cursor.on('close', function() {   
                                    if(i == result.fil_actu[0].length - 1){
                                        allResponse.sort();
                                        allResponse.sort(function(a, b){
                                            return a.publishedAt - b.publishedAt;
                                        });
                                        res.status(200).json({ all: {
                                            User: {nom: result.nom, prenom: result.prenom, pseudo: result.pseudo,email: result.email,dateinscription: result.dateinscription }, 
                                            abo: allAbonnements, 
                                            news: allResponse}});
                                    }
                                });
                            }

                        }
                    }); 
                }else{
                    res.status(400).json({ error: "Incorrect password"});
                }
            }else{
                res.status(400).json({ error: "Incorrect email"});
            }

        });
               
    });

    const nodemailer = require('nodemailer');
app.route('/email')
    .get((req, res)=> {

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: 'richard.chandon@gmail.com, baz@example.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
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
        let hash = bcrypt.hashSync(password);
        var query = { email: email};
        collection.findOneAndUpdate(query, { $set: {  
            nom: nom,
            prenom: prenom,
            pseudo: pseudo,
            password: hash,
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
                    query  = Users.where({pseudo : user});
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
                    })
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

// Chercher une playlist à l'aide de l'id_playlist et/ou du nom
app.route('/playlist/search')
    .get((req, res) => {

        let id_playlist = req.query["id_playlist"] || "";
        let nom = req.query["nom"] || "";

        var arrayPlaylistByName = [];

        var query_id_playlist = Playlists.where({id_playlist : id_playlist})
        var query_nom_playlist = Playlists.where({nom : nom})

        query_id_playlist.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(200).json({id_playlist: result});
            } else {
                var cursor = Playlists.find({nom :nom}).cursor();
                cursor.on('data', function(doc) { arrayPlaylistByName.push(doc); });

                cursor.on('close', function() {
                    if (arrayPlaylistByName.length > 0) {
                        res.status(200).json({ arrayPlaylistByName });
                    } else {
                        res.status(400).json({error: "No playlist found in database"});
                    }
                });
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