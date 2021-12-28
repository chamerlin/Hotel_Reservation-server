const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoomCategorySchema = new Schema({
    name: {type:String},
    quantity: {type:Number, default:0},
    price: {type:Number},
    image: {type:String},
    description: {type:String},
})

module.exports = mongoose.model('RoomCategory', RoomCategorySchema)