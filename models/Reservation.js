const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { isMobilePhone } = require('validator')


const reservationSchema = new Schema({
    customerId: {type:String},
    customerName: {type:String},
    contactNo: {type:String, isValid:[isMobilePhone, "Please enter a valid phone number"] },
    numberOfGuest: {type:String},
    rooms: [{
        roomId: {type:String},
        roomNumber: {type:String},
    }],
    categoryId: {type:String},
    quantity: {type:Number, default: 1},
    price: {type: Number},
    total:{type:Number},
    checkInDate: {type:String},
    days: {type: Number},
    isCheckIn: {type: Boolean, default:false},
    checkInTime: {type:String},
    reservationDate: {type:Date, default:Date.now()},
})


module.exports = mongoose.model('Reservation', reservationSchema)