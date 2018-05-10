
var express = require('express'); 
var mongoose = require('mongoose');
var Users = require('../Models/model');
const usersRoute = express.Router();
usersRoute.route('/inscription/:nom&:prenom&:pseudo&:email&:password&:abonnement')
    .get((req, res) => {
        console.log(req.params.nom);
        var conn = mongoose.connection;
        let user = new Users({nom: req.params.nom,prenom: req.params.prenom,pseudo: req.params.pseudo,email: req.params.email,password: req.params.password,abonnement: req.params.abonnement});
        user.save();
        var query  = Users.where({email :req.params.email});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
            }else{         
                conn.collection('utilisateur').insert(user);
                res.status(201).send(user) 
            }
        });
    })
    .post((req, res) => {
        let user = new Users(req.params.nom,req.params.prenom,req.params.pseudo,req.params.email,req.params.abonnement);
        user.save();
        res.status(201).send(user) 
    })
    usersRoute.route('/connexion/:pseudo&:password')
    .get((req, res) => {
        console.log(req.params.pseudo);
        var conn = mongoose.connection;
        var query  = Users.where({pseudo :req.params.pseudo,password:req.params.password});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                console.log("Connexion ok");
            }else{
                console.log("This username doesn't existe");
            }
        });        
    })
module.exports = usersRoute;
