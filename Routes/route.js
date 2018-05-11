
var express = require('express'); 
var mongoose = require('mongoose');
var Users = require('../Models/model');
var conn = mongoose.connection;
const usersRoute = express.Router();
usersRoute.route('/inscription/:nom&:prenom&:pseudo&:email&:password&:abonnement')
    .post((req, res) => {
        let user = new Users({nom: req.params.nom,prenom: req.params.prenom,pseudo: req.params.pseudo,email: req.params.email,password: req.params.password,abonnement: req.params.abonnement});
        user.save();
        var query  = Users.where({email :req.params.email});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(400).send("This user email already existe");
            }else{         
                conn.collection('utilisateur').insert(user);
                res.status(201).send(user); 
            }
        });
    })

    usersRoute.route('/connexion/:pseudo&:password')
    .get((req, res) => {
        var query  = Users.where({pseudo :req.params.pseudo,password:req.params.password});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(200).send(result);
            }else{
                res.status(400).send("Incorrect pseudo or password");
            }
        });        
    })
    
    usersRoute.route('/update/:email&:nom&:prenom&:pseudo&:password&:abonnement')
    .post((req, res) => {
        try {
            conn.collection('utilisateur').updateOne(
               { "email" : req.params.email },
               { $set: {"nom" : req.param.nom, "prenom" : req.param.prenom, "pseudo" : req.param.pseudo,"password" : req.param.password, "abonnement" : req.param.abonnement } },
               { upsert: true }
            );
         } catch (e) {
            print(e);
         }       
    })
module.exports = usersRoute;
