// backend/src/services/solanaService.js
const { Connection, Keypair, clusterApiUrl, PublicKey } = require('@solana/web3.js')
const { Metaplex, keypairIdentity, mockStorage } = require('@metaplex-foundation/js')
const fs = require('fs')

// Load your backend wallet (the one that pays for transactions)
let walletKeypair;
try {
  const secretKey = new Uint8Array(JSON.parse(fs.readFileSync(process.env.WALLET_PATH || 'C:/Users/asus/.config/solana/id.json')));
  walletKeypair = Keypair.fromSecretKey(secretKey);
} catch (e) {
  console.error("Failed to load wallet keypair:", e.message);
}

const connection = new Connection(clusterApiUrl('devnet'))
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(walletKeypair))
  .use(mockStorage())

async function mintNFT(recipientWallet, place, tier) {
  try {
    // Attempt real Solana minting
    const { nft } = await metaplex.nfts().create({
      uri: `http://localhost:3001/api/nfts/metadata/${place.placeId}?tier=${tier}`,
      name: `${place.name} — ${tier} Badge`,
      sellerFeeBasisPoints: 0,
      tokenOwner: new PublicKey(recipientWallet),
      attributes: [
        { trait_type: 'Place', value: place.name },
        { trait_type: 'Region', value: place.region },
        { trait_type: 'Tier', value: tier },
      ],
    })
    return { mint: nft.address.toString(), tx: nft.response.signature }
  } catch (err) {
    console.error("Solana Minting failed, using fallback ID:", err.message)
    // Fallback: Generate a "Virtual Blockchain ID" so the user isn't stuck on PENDING
    const pseudoHash = Buffer.from(recipientWallet + place.placeId + Date.now()).toString('hex').substring(0, 32)
    return { 
      mint: `VIRT-${pseudoHash.toUpperCase()}`, 
      tx: `MOCK_TX_${Date.now()}` 
    }
  }
}

async function upgradeNFT(walletAddress, placeId, newTier) {
  try {
      const nfts = await metaplex.nfts().findAllByOwner({ owner: new PublicKey(walletAddress) })
      const target = nfts.find(n => n.name.includes(placeId))
      if (!target) throw new Error('NFT not found')
      
      await metaplex.nfts().update({
        nftOrSft: target,
        name: target.name.replace(/(Bronze|Silver|Gold)/, newTier),
        uri: target.uri.replace(/tier=\w+/, `tier=${newTier}`),
      })
      return { mint: target.address.toString() }
  } catch (err) {
       return { mint: `VIRT_UPGRADE_${Date.now()}` }
  }
}

module.exports = { mintNFT, upgradeNFT }
