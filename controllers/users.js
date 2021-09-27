const User = require('../models/user')
const Campground = require('../models/campground')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const async = require('async')


// User Profile
module.exports.renderUserProfile = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'User not found!')
        return res.redirect('/campgrounds')
    }
    const campgrounds = await Campground.find({ author: id })
    res.render('users/userProfile', { user, campgrounds })
}



//User Registration

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}




module.exports.register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        const user = await new User({ username, email, firstName, lastName })
        if (req.file) {
            const { path, filename } = req.file
            user.avatar = { url: path, filename }
        }
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err)
            req.flash('success', 'Welcome to Yelp Camp')
            res.redirect('/campgrounds')
        })

    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}


// User Log in


module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome back!')
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}


// User Log out


module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged out!')
    res.redirect('/campgrounds')
}





// Password Reset

module.exports.renderForgotForm = (req, res) => {
    if (!req.user) {
        res.render('users/forgot')
    }
    else {
        req.flash('error', 'You are already logged in.')
        res.redirect(`/users/${req.user._id}/profile`)
    }
}


module.exports.sendResetEmail = (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            const smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'yelpcamp2021@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            const mailOptions = {
                to: user.email,
                from: 'yelpcamp2021@gmail.com',
                subject: 'Yelp camp Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
};




module.exports.renderResetForm = (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('users/reset', { token: req.params.token });
    });
};

module.exports.resetPassword = (req, res) => {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('/forgot');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.login(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('/reset');
                }
            });
        },
        function (user, done) {
            const smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'learntocodeinfo@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            const mailOptions = {
                to: user.email,
                from: 'learntocodeinfo@mail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/campgrounds');
    });
};