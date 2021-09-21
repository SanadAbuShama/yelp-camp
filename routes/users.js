const express = require('express')
const router = express.Router();
const User = require('../models/user')
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError')
const { urlencoded } = require('express');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegisterForm)
    .post(wrapAsync(users.register))


router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)



router.get('/logout', users.logout)



module.exports = router;