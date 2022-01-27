const express = require('express')
const router = express.Router()
const Room = require('../models/Room')
const auth = require('../middleware/auth')
const Reservation = require('../models/Reservation')
const RoomCategory = require('../models/RoomCategory')

//VIEW ALL
router.get('/', auth, async (req, res) => {
    
    try{
        if(req.user.isAdmin) {
            let allReservations = await Reservation.find({})
            return res.json(allReservations)
        } else {
            let userId = req.user.id
            const reservation = await Reservation.find({userId})
            return res.json(reservation)
        }
    }catch(e){
        return res.json(400).json({msg: "No Reservation"})
    }
})

//ADD
router.post('/', auth, async(req, res) => {
    try{
        const customerId = req.user.id
        const { name, numberOfGuest, contactNo, categoryId, quantity, checkInDate, checkInTime, days} = req.body
        const room = await Room.find({categoryId, availibility: true}).limit(quantity)
        const roomCategory = await RoomCategory.findOne({_id: categoryId, quantity: {$gte:0}})
        if(roomCategory === 0) return res.json({msg: 'There is no vacant room in this category'})
        if(quantity > room.length) return res.json({msg: "Number exceed the available rooms"})
        
        const reservation = new Reservation({
            customerId,
            customerName: name,
            numberOfGuest,
            contactNo,
            categoryId,
            quantity,
            price: roomCategory.price,
            checkInDate,
            days,
            checkInTime,
            total: quantity * roomCategory.price
        })
        
        room.forEach(async bookedRoom => {
            reservation.rooms.push({
                roomId: bookedRoom._id,
                roomNumber: bookedRoom.roomNumber
            })
            bookedRoom.save()
        })
        roomCategory.quantity -= quantity
        await roomCategory.save()
        await reservation.save()
        return res.json({msg: "Reserved", reservation})

    } catch(err) {
        return res.json(err)
    }
})

//DELETE
router.delete('/:id', auth, async(req, res) => {
    if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorized, not an admin"})

    try{
        let reservation = await Reservation.findById(req.params.id)
        if(!reservation) return res.json({msg: "No such reservation"})
        const allRooms = await Room.find({})
        const oriRoomCategory = await RoomCategory.findById(reservation.categoryId)

        if(oriRoomCategory){
            oriRoomCategory.quantity += reservation.quantity
            await oriRoomCategory.save()
        }


        reservation.rooms.forEach(previousBookedRoom => {
            allRooms.forEach(async rooms => {
                if(previousBookedRoom.roomId == rooms._id){
                    await rooms.save()
                }

            })
        })

        await reservation.remove()
        return res.json({msg: "Reservation Deleted"})
    } catch(err){
        return res.status(400).json({msg: "Reservation was unable to be deleted"})
    }
})

//CHECK IN
router.put('/checkIn/:id', auth, async (req, res) => {
    if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorize, not an admin"})
    try{
        let reservation = await Reservation.findById(req.params.id)
        reservation.isCheckIn = true

        reservation.save()
        return res.json({msg: "Successfully Check In have a nice day", reservation})

    } catch(e) {
        return res.status(400).json({msg: "Unable to Check In"})
    }
})

//CHECK OUT
router.put('/checkOut/:id', auth, async (req, res) => {
    if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorize, not an admin"})
    try{
        let reservation = await Reservation.findById(req.params.id)
        if(!reservation) return res.json({msg: "No such reservation"})
        const allRooms = await Room.find({})
        const oriRoomCategory = await RoomCategory.findById(reservation.categoryId)

        if(!oriRoomCategory){
            oriRoomCategory.quantity += reservation.quantity
            await oriRoomCategory.save()
        }

        reservation.rooms.forEach(previousBookedRoom => {
            allRooms.forEach(async rooms => {
                if(previousBookedRoom.roomId == rooms._id){
                    rooms.availibility = true
                    await rooms.save()
                }

            })
        })

        await reservation.remove()
        return res.json({msg: "Successfully Check Out, Have a nice day", reservation})

    } catch(e) {
        return res.status(400).json({msg: "Unable to Check In"})
    }
})

module.exports = router