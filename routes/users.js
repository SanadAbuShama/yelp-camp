const express = require('express')
const router = express.Router();
const User = require('../models/user')
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError')
const { urlencoded } = require('express');
const passport = require('passport');
const users = require('../controllers/users');
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })


router.get('/users/:id/profile', users.renderUserProfile)

router.route('/register')
    .get(users.renderRegisterForm)
    .post(upload.single('avatar'), wrapAsync(users.register))


router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)



router.get('/logout', users.logout)

router.route('/forgot')
    .get(users.renderForgotForm)
    .post(users.sendResetEmail)

router.route('/reset/:token')
    .get(users.renderResetForm)
    .post(users.resetPassword)

module.exports = router;