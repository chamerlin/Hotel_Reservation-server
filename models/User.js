const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { isEmail } = require('validator')

const UserSchema = new Schema({
    fullname: {type:String},
    email: {type:String, isValid:[isEmail, "Please enter a valid Email"]},
    password: {type:String},
    isAdmin: {type:Boolean, default:false}
})

module.exports = mongoose.model('User', UserSchema)