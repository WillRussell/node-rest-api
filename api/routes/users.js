const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {

  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({ // 409: we have the resources to handle this, but theres a conflict
          message: 'Email address already exists'
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => { // number of salting rounds -- 10 is considered safe. 
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {

            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });

            user.save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: 'User Created'
                })
              })
              .catch(err => {
                console.log(err);
                return res.status(500).json({
                  error: err
                });
              });

          }
        });
      }
    })
    .catch()


});


router.post('/login', (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {

      // Check to see if email matches w/an existing user
      if (user.length < 1) {
        return res.status(401).json({ // 401: Unauthorized
          message: "Auth Failed"
        });
      }

      // Check if the password received in plain text matches the hashed password in the db
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {

        if (err) {
          return res.status(401).json({
            message: "Auth Failed"
          });
        }

        if (result) {
          return res.status(200).json({
            message: 'Auth successful'
          })
        }

        return res.status(401).json({
          message: "Auth Failed"
        });
      })

    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    });
});


router.delete('/:userId', (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'User deleted'
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    });
})


module.exports = router;