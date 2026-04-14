const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourismchain')

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/places', require('./routes/places'))
app.use('/api/visits', require('./routes/visits'))
app.use('/api/leaderboard', require('./routes/leaderboard'))
app.use('/api/nfts', require('./routes/nfts'))

app.listen(3001, () => console.log('Backend running on port 3001'))
