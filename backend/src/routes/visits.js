// backend/src/routes/visits.js
const express = require('express')
const router = express.Router()
const Tourist = require('../models/Tourist')
const Place = require('../models/Place')
const Visit = require('../models/Visit')
const { verifyQR } = require('../services/qrService')
const { mintNFT, upgradeNFT } = require('../services/solanaService')

router.post('/verify-visit', async (req, res) => {
  const { qrData, walletAddress } = req.body
  
  try {
    // 1. Parse QR data
    const parts = qrData.split(':')
    if (parts.length < 2) return res.status(400).json({ error: 'Invalid QR format' })
    const placeId = parts[1]
    
    // 2. Find the place
    const place = await Place.findOne({ placeId })
    if (!place) return res.status(404).json({ error: 'Place not found in database' })
    
    // 3. Verify QR is authentic
    if (!verifyQR(qrData, place.qrSecret)) {
      return res.status(400).json({ error: 'Invalid or expired QR code' })
    }
    
    // 4. Check if already visited TODAY (anti-cheat)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const alreadyVisited = await Visit.findOne({
      walletAddress, placeId, visitedAt: { $gte: today }
    })
    if (alreadyVisited) {
      return res.status(400).json({ error: 'Already visited today' })
    }
    
    // 5. Get or create tourist
    let tourist = await Tourist.findOne({ walletAddress })
    if (!tourist) {
        tourist = new Tourist({ walletAddress })
    }
    
    // 6. Count total historical visits to this place
    const totalPlaceVisits = await Visit.countDocuments({ walletAddress, placeId })
    
    // 7. Mint or upgrade NFT
    let nftResult
    try {
        if (totalPlaceVisits === 0) {
          // First visit: mint Bronze NFT
          nftResult = await mintNFT(walletAddress, place, 'Bronze')
        } else if (totalPlaceVisits === 4) {
          // 5th visit: upgrade to Silver
          nftResult = await upgradeNFT(walletAddress, placeId, 'Silver')
        } else if (totalPlaceVisits === 9) {
          // 10th visit: upgrade to Gold
          nftResult = await upgradeNFT(walletAddress, placeId, 'Gold')
        }
    } catch (solanaError) {
        console.error("Solana operation failed:", solanaError.message)
        // We continue recording the visit even if NFT fails, or we could fail here.
        // For hackathon, let's at least record the visit.
    }
    
    // 8. Record visit
    tourist.totalVisits += 1
    await tourist.save()
    
    const visit = new Visit({ 
        walletAddress, 
        placeId, 
        nftMint: nftResult?.mint, 
        txSignature: nftResult?.tx 
    })
    await visit.save()
    
    res.json({ 
      message: `Visit recorded! ${totalPlaceVisits === 0 ? 'Bronze NFT minted!' : 'Visit counted!'}`,
      tier: totalPlaceVisits === 0 ? 'Bronze' : totalPlaceVisits === 4 ? 'Silver' : 'counting'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
