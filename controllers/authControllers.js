const User = require("../models/User");
const passport = require("passport");


module.exports.login_get = (req, res) => {
    res.render('login.ejs');
}

module.exports.login_post = (req, res) => {
    const user = new User({
    username: req.body.username,
    password: req.body.password,
    });

    req.logIn(user, err => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => res.redirect("/secrets"));
        }
    });    
}

module.exports.register_get = (req, res) => {
    res.render('register.ejs');
}

module.exports.register_post = async(req, res) => {
    try {
        const registerUser = await User.register({username: req.body.username}, req.body.password);
        if(registerUser){
            passport.authenticate('local')(req, res, () => res.redirect('/secrets'));
        }else{
            res.redirect('/register');
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports.logout_get = (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  }

module.exports.google_get = passport.authenticate('google', { scope: ['profile'] });
module.exports.facebook_get = passport.authenticate('facebook');



