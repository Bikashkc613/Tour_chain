// backend/fix_pending_badges.js
const mongoose = require('mongoose');
const Visit = require('./src/models/Visit');
require('dotenv').config();

async function fixPending() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourismchain');
  console.log("Connected to MongoDB...");

  // Find visits with no mint address
  const pendingVisits = await Visit.find({ 
    $or: [
      { nftMint: { $exists: false } },
      { nftMint: null },
      { nftMint: "" }
    ]
  });

  console.log(`Found ${pendingVisits.length} pending visits. Fixing...`);

  for (const visit of pendingVisits) {
    const pseudoHash = Buffer.from(visit.walletAddress + visit.placeId + visit.visitedAt).toString('hex').substring(0, 32);
    visit.nftMint = `VIRT-${pseudoHash.toUpperCase()}`;
    visit.txSignature = `TX_RECOVERY_${Date.now()}`;
    await visit.save();
  }

  console.log("Migration complete. All badges now have IDs.");
  await mongoose.disconnect();
}

fixPending().catch(err => console.error(err));
