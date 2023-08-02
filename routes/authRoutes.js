const { Router } = require("express");
const authController = require("../controllers/authControllers");

const router = Router();

router.route("/register")
    .get(authController.register_get)
    .post(authController.register_post);

router.route("/login")
    .get(authController.login_get)
    .post(authController.login_post);

router.route("/logout")
    .get(authController.logout_get);

router.route("/auth/google")
    .get(authController.google_get);

router.route('/auth/facebook')
    .get(authController.facebook_get)

module.exports = router;