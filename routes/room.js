const express = require('express')
const router = express.Router()
const Room = require('../models/Room')
const RoomCategory = require('../models/RoomCategory')
const auth = require('../middleware/auth')

//VIEW ALL ROOM
router.get('/', auth, async (req, res) => {
    if(!req.user.isAdmin) return res.json({msg: "Unauthorized, not an admin"})
    try{
         let rooms = await Room.find({})
        return res.json(rooms)
    }catch(e){
        return res.status(400).json({msg: "There is no such room"})
    }
})

//VIEW ROOM WITH SAME CATEGORY
router.get('/search/:key', auth, async (req, res) => {
    if(!req.user.isAdmin) return res.json({msg: "Unauthorized, not an admin"})
    try{
        let rooms = await Room.find({category: {$regex: req.params.key, $options: "i"}})
        if(rooms.length) {
            return res.json(rooms)
        } else {
            return res.status(400).json({msg: "No product to show"})
        }
    }catch(err){
        return res.status(400).json({msg: "Room can't be found"})
    }
})


//ADD ROOM
router.post('/', auth, async (req, res) =>{
    if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorize, not an admin"})
    
    try{ 
        const {roomNumber, categoryId } = req.body
        let roomCategory = await RoomCategory.findById(categoryId)
        let allRoom = await Room.find({})

        const room = await new Room({
            roomNumber,
            category:[{
                categoryId,
                name: roomCategory.name
            }],
            Availibility: true
        })
        
        roomCategory.quantity = 1

        allRoom.forEach(async perRoom => {
          perRoom.category.forEach(async roomDetails => {
                if(roomDetails.categoryId === categoryId){
                    roomCategory.quantity += 1
                }
                await RoomCategory.updateOne({"roomCategory._id": categoryId}, roomCategory.quantity)
                await roomCategory.save()
            }) 
        })
        
        
        await room.save()
        return res.json({msg: "Room added successfully",  room})
    } catch(err) {
        return res.status(400).json({msg: "Fail to add room"})
    }
})

//EDIT ROOM
router.put('/:id', auth, async(req, res) => {
    try{
        const room = await Room.findById(req.params.id)
        if(!room) return res.json({msg: "Room is not created"})
        const {roomNumber, category} = req.body

        room.roomNumber = roomNumber
        room.category = category

        await Room.updateOne({_id:req.params.id}, room)
        await room.save()

        return res.json({ msg:"Room updated", room})
    } catch(err) {
        return res.json({msg:"Unable to update room"})
    }
})

//DELETE ROOM
router.delete('/:id', auth, async (req, res) => {
    if(!req.user.isAdmin) return res.status(400).json({msg: "Unauthorized, not an admin"})

    try{
        let room = await Room.findById(req.params.id)
        if(!room) return res.json({msg: "Room is not found"})

        await room.remove()
        return res.json({msg: "Room deleted"})
    } catch(err) {
        return res.json({msg: "Unable to delete room"})
    }
})


module.exports = router