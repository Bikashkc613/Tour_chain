const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { 
  createTree, 
  mintV1, 
  fetchMerkleTree, 
  mplBubblegum, 
  findLeafAssetIdPda 
} = require('@metaplex-foundation/mpl-bubblegum');
const { 
  createSignerFromKeypair, 
  keypairIdentity, 
  none, 
  publicKey 
} = require('@metaplex-foundation/umi');
const { TokenStandard } = require('@metaplex-foundation/mpl-token-metadata');
const fs = require('fs');
require('dotenv').config();

// Initialize Umi
const umi = createUmi(process.env.SOLANA_RPC || 'https://api.devnet.solana.com');

// Load wallet
const walletFile = fs.readFileSync(process.env.WALLET_PATH || 'C:/Users/asus/.config/solana/id.json', 'utf-8');
const walletJson = JSON.parse(walletFile);
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(walletJson));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(keypairIdentity(signer));
umi.use(mplBubblegum());

// This will be stored in your .env or a DB config after setup
const MERKLE_TREE_PUBKEY = process.env.MERKLE_TREE_PUBKEY;

/**
 * Mints a compressed NFT for a visit
 */
async function mintVisitCNFT(userWallet, placeMetadata, tier) {
  if (!MERKLE_TREE_PUBKEY) {
    throw new Error('Merkle Tree not initialized. Please run setup script.');
  }

  console.log(`Minting ${tier} cNFT for ${userWallet} at ${placeMetadata.name}...`);

  const merkleTree = publicKey(MERKLE_TREE_PUBKEY);
  
  const { signature } = await mintV1(umi, {
    leafOwner: publicKey(userWallet),
    merkleTree,
    metadata: {
      name: `${placeMetadata.name} - ${tier}`,
      symbol: 'TCN',
      uri: `https://tourismchain.vercel.app/api/nfts/metadata/${placeMetadata.placeId}?tier=${tier}`,
      sellerFeeBasisPoints: 0,
      collection: none(),
      creators: [{ address: umi.identity.publicKey, verified: true, share: 100 }],
    },
  }).sendAndConfirm(umi);

  // In cNFTs, we don't get a mint address like standard NFTs. 
  // We use the signature or find the leaf index.
  return { 
    mint: `cNFT-${signature.toString().substring(0, 8)}`, 
    tx: signature.toString() 
  };
}

/**
 * Mints a compressed NFT for a route checkpoint
 */
async function mintCheckpointCNFT(userWallet, routeName, checkpointName) {
  if (!MERKLE_TREE_PUBKEY) {
    throw new Error('Merkle Tree not initialized.');
  }

  console.log(`Minting Checkpoint cNFT for ${userWallet} at ${routeName}:${checkpointName}...`);

  const merkleTree = publicKey(MERKLE_TREE_PUBKEY);
  
  const { signature } = await mintV1(umi, {
    leafOwner: publicKey(userWallet),
    merkleTree,
    metadata: {
      name: `${routeName} Checkpoint: ${checkpointName}`,
      symbol: 'TCN',
      uri: `https://tourismchain.vercel.app/api/checkpoints/metadata?route=${routeName}&point=${checkpointName}`,
      sellerFeeBasisPoints: 0,
      collection: none(),
      creators: [{ address: umi.identity.publicKey, verified: true, share: 100 }],
    },
  }).sendAndConfirm(umi);

  return { 
    mint: `cNFT-${signature.toString().substring(0, 8)}`, 
    tx: signature.toString() 
  };
}

/**
 * Setup a new Merkle Tree (One-time setup)
 * Adjust maxDepth/maxBufferSize based on expected volume
 */
async function setupTree() {
  console.log("Setting up Merkle Tree for cNFTs...");
  
  const merkleTree = umi.eddsa.generateKeypair();
  
  const { signature } = await createTree(umi, {
    merkleTree,
    maxDepth: 14, // Supports up to 16,384 assets
    maxBufferSize: 64,
    public: false,
  }).sendAndConfirm(umi);

  console.log(`Merkle Tree created!`);
  console.log(`Pubkey: ${merkleTree.publicKey}`);
  console.log(`Signature: ${signature}`);
  
  return merkleTree.publicKey;
}

module.exports = { mintVisitCNFT, mintCheckpointCNFT, setupTree };
