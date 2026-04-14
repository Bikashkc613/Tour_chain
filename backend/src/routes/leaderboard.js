const express = require('express')
const router = express.Router()
const Tourist = require('../models/Tourist')
const Visit = require('../models/Visit')

// Get global leaderboard (top tourists by total visits)
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const tourists = await Tourist.find()
      .sort({ totalVisits: -1 })
      .limit(limit)
    res.json(tourists)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get leaderboard by region
router.get('/region/:region', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const tourists = await Tourist.find({ country: req.params.region })
      .sort({ totalVisits: -1 })
      .limit(limit)
    res.json(tourists)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get leaderboard by specific place
router.get('/place/:placeId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const visits = await Visit.aggregate([
      { $match: { placeId: req.params.placeId } },
      { $group: { _id: '$walletAddress', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'tourists',
          localField: '_id',
          foreignField: 'walletAddress',
          as: 'tourist'
        }
      }
    ])
    res.json(visits)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get tourist rank (position in leaderboard)
router.get('/rank/:walletAddress', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ walletAddress: req.params.walletAddress })
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' })
    }

    const rank = await Tourist.countDocuments({ totalVisits: { $gt: tourist.totalVisits } })
    res.json({ walletAddress: req.params.walletAddress, rank: rank + 1, totalVisits: tourist.totalVisits })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
