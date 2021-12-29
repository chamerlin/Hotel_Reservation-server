const mongoose = require('mongoose')
const Schema = mongoose.Schema

const paymentSchema = new Schema({
    userId: {type:String},
    reservationId: {type:String},
    categoryId: {type:String},
    quantity: {type:Number},
    price: {type:Number},
    total: {type:Number},
    payment_date: {type:Date, default:Date.now()}
})

module.exports = mongoose.model('Payment', paymentSchema)