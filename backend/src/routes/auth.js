const express = require('express')
const router = express.Router()
const Tourist = require('../models/Tourist')

// Register/Login route
router.post('/register', async (req, res) => {
  const { walletAddress, name, country } = req.body

  try {
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' })
    }

    let tourist = await Tourist.findOne({ walletAddress })
    
    if (!tourist) {
      tourist = new Tourist({ walletAddress, name, country })
      await tourist.save()
      return res.json({ message: 'Tourist registered successfully', tourist })
    }

    // Update existing tourist info if provided
    if (name) tourist.name = name
    if (country) tourist.country = country
    await tourist.save()

    res.json({ message: 'Tourist logged in', tourist })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get tourist profile
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ walletAddress: req.params.walletAddress })
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' })
    }
    res.json(tourist)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
