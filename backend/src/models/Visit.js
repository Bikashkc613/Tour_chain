const mongoose = require('mongoose')

const VisitSchema = new mongoose.Schema({
  walletAddress: String,
  placeId: String,
  visitedAt: { type: Date, default: Date.now },
  nftMint: String,       // Solana mint address after NFT is created
  txSignature: String    // Solana transaction ID
})

module.exports = mongoose.model('Visit', VisitSchema)
