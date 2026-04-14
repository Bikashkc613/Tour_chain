// backend/src/routes/nfts.js
const express = require('express')
const router = express.Router()
const Visit = require('../models/Visit')
const Place = require('../models/Place')

// Get all NFT badges for a wallet
router.get('/:walletAddress', async (req, res) => {
  try {
    const visits = await Visit.find({ walletAddress: req.params.walletAddress })
    
    // Enrich with place data
    const nfts = await Promise.all(visits.map(async (visit) => {
      const place = await Place.findOne({ placeId: visit.placeId })
      return {
        mint: visit.nftMint,
        name: place ? `${place.name} Badge` : 'Nepal Badge',
        image: place ? place.nftImageUrl : 'https://via.placeholder.com/150',
        tier: visit.tier || 'Bronze', // Default to bronze if not stored
        tx: visit.txSignature
      }
    }))
    
    // Filter out duplicates (show only the latest for each place)
    const uniqueNfts = []
    const seenPlaces = new Set()
    for (const nft of nfts.reverse()) {
        if (!seenPlaces.has(nft.name)) {
            uniqueNfts.push(nft)
            seenPlaces.add(nft.name)
        }
    }

    res.json(uniqueNfts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Metadata URI for Metaplex to fetch NFT info
router.get('/metadata/:placeId', async (req, res) => {
  try {
    const { tier } = req.query
    const place = await Place.findOne({ placeId: req.params.placeId })
    if (!place) return res.status(404).json({ error: 'Place not found' })

    res.json({
      name: `${place.name} — ${tier} Badge`,
      symbol: 'TCN',
      description: `Official Proof-of-Visit NFT for ${place.name}, Nepal. Tier: ${tier}.`,
      image: `http://localhost:3001${place.nftImageUrl || place.imageUrl}`,
      attributes: [
        { trait_type: 'Place', value: place.name },
        { trait_type: 'Region', value: place.region },
        { trait_type: 'Tier', value: tier }
      ],
      properties: {
        files: [
          {
            uri: `http://localhost:3001${place.nftImageUrl || place.imageUrl}`,
            type: 'image/jpeg'
          }
        ],
        category: 'image'
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
