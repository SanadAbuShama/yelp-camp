const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportlocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true

    },
    firstName: String,
    lastName: String,
    avatar: {
        url: String,
        filename: String
    },
    restPasswordToken: String,
    resetPasswordExpires: Date
})

UserSchema.plugin(passportlocalMongoose)

module.exports = mongoose.model('User', UserSchema)