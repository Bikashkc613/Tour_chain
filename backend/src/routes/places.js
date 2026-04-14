const express = require('express')
const router = express.Router()
const Place = require('../models/Place')
const { generateQR } = require('../services/qrService')

// Create a new place
router.post('/create', async (req, res) => {
  const { placeId, name, description, location, region, imageUrl, nftImageUrl, qrSecret } = req.body

  try {
    if (!placeId || !name || !qrSecret) {
      return res.status(400).json({ error: 'placeId, name, and qrSecret required' })
    }

    const existingPlace = await Place.findOne({ placeId })
    if (existingPlace) {
      return res.status(400).json({ error: 'Place already exists' })
    }

    const place = new Place({
      placeId,
      name,
      description,
      location,
      region,
      imageUrl,
      nftImageUrl,
      qrSecret
    })

    await place.save()
    res.json({ message: 'Place created successfully', place })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all places
router.get('/all', async (req, res) => {
  try {
    const places = await Place.find()
    res.json(places)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get place by ID
router.get('/:placeId', async (req, res) => {
  try {
    const place = await Place.findOne({ placeId: req.params.placeId })
    if (!place) {
      return res.status(404).json({ error: 'Place not found' })
    }
    res.json(place)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Generate QR for a place
router.get('/:placeId/generate-qr', async (req, res) => {
  try {
    const place = await Place.findOne({ placeId: req.params.placeId })
    if (!place) {
      return res.status(404).json({ error: 'Place not found' })
    }

    const { qrData, qrImage } = await generateQR(place.placeId, place.qrSecret)
    res.json({ qrData, qrImage })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
