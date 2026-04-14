const mongoose = require('mongoose')

const TouristSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: String,
  country: String,
  totalVisits: { type: Number, default: 0 },
  nftMints: [String],   // list of NFT mint addresses
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Tourist', TouristSchema)
