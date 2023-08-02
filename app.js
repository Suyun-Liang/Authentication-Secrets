//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const session = require('express-session');
const passport = require("passport");
const User = require("./models/User");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connect local db"))
    .catch(err => console.log(err));


passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
   
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIRNT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
 
app.get("/",(req, res) => res.render('home.ejs'));

app.get("/secrets", (req, res) => {
    User.find({'secret': {$exists: true}}, 'secret')
        .then(foundSecrets => res.render('secrets.ejs', {secrets: foundSecrets}))
        .catch(err => console.log(err));
});

app.route("/submit")
    .get((req, res) => {
        if(req.isAuthenticated()){
            res.render('submit.ejs');
        }else{
            res.redirect("/login");
        }
    })
    .post((req, res) => {
        const submittedSecret = req.body.secret;
        User.findByIdAndUpdate(req.user._id, {secret: submittedSecret})
            .then(() => res.redirect('/secrets'))
            .catch(err => console.log(err));
    });


app.route('/auth/google/secrets')
    .get(
        passport.authenticate('google', { failureRedirect: '/login' }),
        (req, res) => res.redirect('/secrets')
        );

app.route('/auth/facebook/callback')
    .get(
        passport.authenticate('facebook', { failureRedirect: '/login' }),
        (req, res) => res.redirect('/secrets')
        );

app.use(authRoutes);



app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});