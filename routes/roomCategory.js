const express = require('express')
const router = express.Router()
const RoomCategory = require('../models/RoomCategory')
const auth = require('../middleware/auth')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const Room = require('../models/Room')

// VIEW ALL
router.get('/', async (req, res) => {
    try{
        let category = await RoomCategory.find({})
        return res.json(category)
    } catch (err) {
        return res.status(400).json({msg: "No room category is available please add one"})
    }
})

//ADD 
router.post('/', auth, (req, res) => {
    if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorized not an admin"})
    
    try{
        const form = new formidable.IncomingForm()
        form.parse(req, (err, fields, files) => {
            if(err) return res.json({err})
            let date = new Date().getTime()
            const category = new RoomCategory(fields)

            let oldPath = files.image.filepath
            let newPath = path.join(__dirname, "../public/") + date + "-" + files.image.originalFilename
            let rawData = fs.readFileSync(oldPath)
            fs.writeFileSync(newPath, rawData)
            category.image = "/public/" + date + "-" + files.image.originalFilename


            category.save()
            return res.json({msg: "Item added successfully", category})
        })
    }catch(err) {
        return res.json({msg: "Item couldn't be added"})
    }
})

//EDIT
router.put('/:id', auth, async (req, res) => {
    if(!req.user.isAdmin) return res.status(400).json({msg: "Unauthorized not an admin"})
    
    try{
        let category = await RoomCategory.findOne({_id: req.params.id})
        
        if(!category) return res.json({msg: "Not category found"})
        
        const form = new formidable.IncomingForm()
        form.parse(req, async (err, fields, files) => {
            if(err) return res.json({err})
            let date = new Date().getTime()
            
            category.name = fields.name !== "" ? fields.name : category.name
            category.price = fields.price !== "" ? fields.price : category.price
            category.description = fields.description !== "" ? fields.description : category.description
            
            if(files.image == null) {
                category.image = category.image
            } else {
                let oldPath = files.image.filepath
                let newPath = path.join(__dirname, "../public/") + date + "-" + files.image.originalFilename
                let rawData = fs.readFileSync(oldPath)
                fs.writeFileSync(newPath, rawData)
                fs.unlinkSync(path.join(__dirname, "../", category.image))
                category.image = "/public/" + date + "-" + files.image.originalFilename
            }

            await RoomCategory.updateOne({_id: req.params.id}, category)
            await category.save()
            return res.json({msg: "Category updated successfully", category})
        })
    } catch(e) {
        return res.json({msg: "Category couldn't be updated"})
    }
})

//DELETE
router.delete('/:id', auth, async (req, res) => {
    if(!req.user.isAdmin) return res.status(401).json({msg: "Unauthorized, not an admin"})
    try{
        let category = await RoomCategory.findByIdAndDelete(req.params.id)
        fs.unlinkSync(path.join(__dirname, "../", category.image))
        return res.json({msg: "Category deleted successfully"})
    } catch(e) {
        return res.status(400).json({msg: "Cannot delete catergory"})
    }
})


module.exports = router