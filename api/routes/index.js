const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require ('bcryptjs');
const mongoose = require('mongoose');
var User = require('../models/user.js');
var User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const CONFIG = require('../data/config.js');


router.post('/login', function(req, res){
  var email = req.body.email;
  var password = req.body.password;

  User.findOne({
    email
  }).exec(function(err, user){
    if (err){
      console.log(err);
      res.status(400)
        .json(err);
    }
     if(user) {
      if (bcrypt.compareSync(password, user.password)){
        jwt.sign({ id: user._id, name: user.name }, CONFIG.HASH_PASSWORD_SECRET, { expiresIn: '900000s' },  (err, token) => {
        res.status(200)
          .json({token})
          console.log(token);
        });
    }
    else {
     console.log('You are not registered');
     res.status(401)
       .json('Unauthorized');
   }
 } else {
   res.json({success: false, message: 'user doesnt exist'})
 }
});
});

router.post('/register', function(req, res){
  var name = req.body.name || null;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();
  if (errors){
    console.log(errors);
    res.status(500)
      .json(errors);
  } else {
    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(password, salt, function(error, hash){
        if(err){
          console.log(err);
          }
          let newUser = new User({
          name,
          email,
          password:hash,
          });
          newUser.save(function(err, result){
            if(error){
              console.log(err);
              return;
            } else {
              res
                 .json(result)
                 //TODO: redirect to the login view when it's made. 
                 //.redirect('../public/login.html');
          }
        })
      });
    })
  }
});
module.exports = router;
