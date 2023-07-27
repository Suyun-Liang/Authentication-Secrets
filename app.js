//jshint esversion:6
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
mongoose.connect("mongodb://127.0.0.1:27017/userDB")
    .then(() => console.log("Connect local db"))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: {
        type:String,
        required: true,
    },
    password: {
        type:String,
        required: true,
    }
});

userSchema.plugin(mongooseFieldEncryption, {
    fields: ["password"],
    secret: process.env.SECRET_KEY,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render('home.ejs');
});

app.route("/login")
    .get((req, res) => {
        res.render('login.ejs');
    })
    .post((req, res) => {
        User.findOne({email: req.body.username})
            .then(result => {
                if(result) {
                    if(result.password === req.body.password){
                        res.render("secrets.ejs");
                    }else{
                        console.log("Incorrect credentials");
                    }  
                }else{
                    console.log("Not registerd email");
                }
            })
            .catch();
    });

app.route("/register")
    .get((req, res) => {
        res.render('register.ejs');
    })
    .post((req, res) => {
        User.findOne({email: req.body.username})
            .then(result => {
                if(!result){
                    User.create({email: req.body.username, password: req.body.password})
                        .then(result => {
                            console.log(`User ${result._id} created`);
                            res.render("secrets.ejs")
                        })
                        .catch(err => console.log(err));
                }else{
                    console.log("Email exists");
                }
            })
            .catch(err => console.log(err));
    });



app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});