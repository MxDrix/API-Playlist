
var express = require('express'); 
var mongoose = require('mongoose');
var Users = require('../Models/model');
var conn = mongoose.connection;
var collection = conn.collection('users');
const usersRoute = express.Router();

// Inscription with nom - prenom - pseudo - email - password - abonnement
// email unique
usersRoute.route('/inscription/:nom&:prenom&:pseudo&:email&:password&:abonnement')
    .post((req, res) => {
        let user = new Users({nom: req.params.nom,prenom: req.params.prenom,pseudo: req.params.pseudo,email: req.params.email,password: req.params.password,abonnement: req.params.abonnement});
        // user.save();
        var query  = Users.where({email :req.params.email});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(400).json({ error: "This user email already existe"});
            }else{         
                collection.insertOne(user);
                res.status(201).json({ Resultat: "New user create"}); 
            }
        });
    });
// Connexion with pseudo and password
usersRoute.route('/connexion/:pseudo&:password')
    .get((req, res) => {
        var query  = Users.where({pseudo :req.params.pseudo,password:req.params.password});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(200).json({ Resultat: result});
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
