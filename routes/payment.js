const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Payment = require('../models/Payment')
const Reservation = require('../models/Reservation')
const RoomCategory = require('../models/RoomCategory')

//Add Bill
router.post('/', auth, async(req, res) => {
    try{
        const customerId = req.user.id
        const reservation = await Reservation.findOne({customerId})

        const {_id, categoryId, quantity, price, total} = reservation

        if(reservation) {
            const payment = await new Payment({
                                customerId,
                                reservationId: _id,
                                categoryId,
                                quantity,
                                price,
                                total
                            })

            await payment.save()
            return res.json({msg: "Paid Successfully", payment})
        }

    }catch(err) {
        return res.status(400).json(err)
    }
})

//View all payment
router.get('/', auth, async(req, res) => {
    try{
        if(req.user.isAdmin){
            let allPayment = await Payment.find({})
            return res.json(allPayment)
        } else {
            let customerId = req.user
            const payment = await Payment.find({customerId})
            return res.json(payment)
        }
    } catch(e){
        return res.status(400).json({msg: "No payment was undergo"})
    }
})

module.exports = router