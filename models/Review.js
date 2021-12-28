const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    description: {type:String},
    date: {type:Date, default:Date.now()},
    author: [{
        authorId: {type:String},
        authorName: {type:String}
    }]
})

module.exports = mongoose.model('Review', ReviewSchema)