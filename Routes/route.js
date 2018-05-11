
var express = require('express'); 
var mongoose = require('mongoose');
var Users = require('../Models/model');
var conn = mongoose.connection;
var collection = conn.collection('utilisateur');
const usersRoute = express.Router();

usersRoute.route('/inscription/:nom&:prenom&:pseudo&:email&:password&:abonnement')
    .put((req, res) => {
        let user = new Users({nom: req.params.nom,prenom: req.params.prenom,pseudo: req.params.pseudo,email: req.params.email,password: req.params.password,abonnement: req.params.abonnement});
        user.save();
        var query  = Users.where({email :req.params.email});
        query.findOne(function (err, result) {
            if (err) return handleError(err);
            if (result) {
                res.status(400).send("This user email already existe");
            }else{         
                collection.insert(user);
                res.status(201).send(user); 
            }
        });
    });
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
    });    
    usersRoute.route('/update/:email&:nom&:prenom&:pseudo&:password&:abonnement')
    .put((req, res) => {
        Users.update({email: req.params.email,
            nom: req.params.nom,
            prenom: req.params.prenom,
            pseudo: req.params.pseudo,
            password: req.params.password,
            abonnement: req.params.abonnement});
    });
    usersRoute.route('/delete/:email')
    .delete((req, res) => {
        try {
            var query = { email: req.params.email};
            collection.findOneAndDelete(query, function(err) {                
                if (err) return res.status(500).send(err);
                return res.status(200).send("User delete");
            });
        }
        catch(e){
            res.status(400).send(e);
        }
    })
module.exports = usersRoute;
