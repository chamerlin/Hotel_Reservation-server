const express = require('express')
const router = express.Router()
const Review = require('../models/Review')
const User = require('../models/User')
const auth = require('../middleware/auth')

//VIEW ALL REVIEW
router.get('/', async (req,res) => {
    try{
        let reviews = await Review.find({})
        return res.json(reviews)
    } catch(err){
        return res.status(400).json({err, msg:" No review available"})
    }
})

//ADD A REVIEW
router.post('/', auth,  async (req, res) => {
    const { description } = req.body

    let user = await User.findOne({_id: req.user.id})
    console.log(req.user.id)

    const review = new Review({
        description,
        author:[{
            authorId: user.id,
            authorName: user.fullname
        }] 
    })
    
    review.save()
    return res.json({
        msg: "Review added successfully",
        review
    })
})

//DELETE A REVIEW
router.delete('/:id', auth, async (req, res) => {
    try{
        let review = await Review.findById(req.params.id)
        if(!review) return res.json({msg: "Review not found"})
        review.author.forEach(async authorDetails => {
            if(authorDetails.authorId.toString() !== req.user.id) return res.json({msg: "This is not your review"})
            else{
                await review.remove()
                return res.json({ msg:"Post is deleted" })
            }
        })
    } catch(e) {
        return res.json({ msg: "This is not your post/ Post not found!"})
    }
})

module.exports = router