const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { body, check, validationResult } = require('express-validator') 
require('dotenv').config()

//REGISTER 
router.post('/register', 
    body('fullname').isLength({min: 3}),
    body('email').isEmail(),
    body('password').isLength({min:8}),
    check('password').exists(),
    check(
        'password2',
        "Confirm password must be the same with the password"
    )
    .exists()
    .custom((value, {req}) => value === req.body.password), 
    async (req, res) => {

        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        } else {
            let { fullname, email, password } = req.body
            
            User.findOne({email}, (err, user) => {
                if(user){
                    return res.status(400).json({msg: "User already exists"})
                } else {
                    let user = new User()
                    user.fullname = fullname
                    user.email = email

                    let salt = bcrypt.genSaltSync(10)
                    let hash = bcrypt.hashSync(password, salt)
                    user.password = hash
                    user.save()
                    return res.json({
                        msg: "Registered Successfully",
                        user
                    })
                }
            })
        }
})

//LOGIN
router.post('/login', (req, res) => {
    try{

        const { email, password } = req.body
    
        User.findOne({email}, (err, user) => {
            if(!(email&&password)) return res.status(400).json({msg: "All input are required"})
            if(!user) return res.json({msg: "User doesn't exists"})
            if(err) return res.status(400).json({err})
    
            let isMatch = bcrypt.compareSync(password, user.password)
    
            if(!isMatch) return res.status(400).json({msg: "Invalid Credentials"})
    
            let payload = {
                id: user.id,
                email: user.email,
                fullname: user.fullname,
                isAdmin: user.isAdmin
            }
    
            jwt.sign(
                payload,
                process.env.SECRET_KEY,
                {expiresIn: "6h"},
                (err, token) => {
                    if(err) return res.status(400).json({err})
    
                    return res.json({
                        msg: "Logged in successfully",
                        token
                    })
                }
            )
        })
    } catch(err) {
        return res.status(400).json({msg: "Invalid Credentials"})
    }
})

//GoogleLogin
router.post('/googleLogin', async(req, res) => {
    const {email, name} = req.body

    try{
        User.findOne({email}, (err, user) => {
            if(err) return res.status(400).json({err})

            if(user){
                let payload = {
                    id: user.id,
                    email: user.email,
                    fullname: user.name,
                    isAdmin: user.isAdmin
                }
        
                jwt.sign(
                    payload,
                    process.env.SECRET_KEY,
                    {expiresIn: "6h"},
                    (err, token) => {
                        if(err) return res.status(400).json({err})
        
                        return res.json({
                            msg: "Logged in successfully",
                            token
                        })
                    }
                )
            } else {
                let user = new User()
                user.fullname = name
                user.email = email

                user.save()

                let payload = {
                    id: user.id,
                    email: user.email,
                    fullname: user.name,
                    isAdmin: user.isAdmin
                }
        
                jwt.sign(
                    payload,
                    process.env.SECRET_KEY,
                    {expiresIn: "6h"},
                    (err, token) => {
                        if(err) return res.status(400).json({err})
        
                        return res.json({
                            msg: "Logged in successfully",
                            token
                        })
                    }
                )
            }
        })
    } catch(err) {
        return res.status(400).json({msg: "Invalid Credentials"})
    }
})

module.exports = router