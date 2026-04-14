const mongoose = require('mongoose')

const PlaceSchema = new mongoose.Schema({
  placeId: { type: String, required: true, unique: true }, // e.g. "everest_base_camp"
  name: String,         // "Everest Base Camp"
  description: String,
  location: {
    lat: Number,
    lng: Number
  },
  region: String,       // "Himalaya", "Kathmandu", etc.
  imageUrl: String,
  nftImageUrl: String,  // image for the NFT badge
  qrSecret: String      // secret embedded in QR to prevent faking
})

module.exports = mongoose.model('Place', PlaceSchema)
