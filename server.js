require('dotenv').config()
const {PORT, DB_NAME, DB_HOST, DB_PORT, DB_PASSWORD} = process.env
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors())
app.use(express.json())

// mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)
mongoose.connect(`mongodb+srv://HuiMin:${DB_PASSWORD}@hotel-reservation.aqydj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
mongoose.connection.once('open', () => console.log('connected to MongoDB'))

app.use(express.static('public'))
app.use('/auth', require('./routes/auth'))
app.use('/review', require('./routes/review'))
app.use('/roomcategory', require('./routes/roomCategory'))
app.use('/room', require('./routes/room'))
app.use('/reservation', require('./routes/reservation'))

app.listen(process.env.PORT, () => console.log(`Server running in port ${PORT}`))

