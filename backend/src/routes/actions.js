const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const Place = require('../models/Place');
const { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const ACTIONS_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Encoding, Accept-Encoding',
};

// GET /api/actions/share-visit/:visitId
// Returns the Action metadata for the Blink
router.get('/share-visit/:visitId', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.visitId);
    if (!visit) return res.status(404).json({ error: 'Visit not found' });
    
    const place = await Place.findOne({ placeId: visit.placeId });
    
    const payload = {
      title: `I visited ${place?.name || 'Nepal'}!`,
      icon: place?.nftImageUrl || 'https://tourismchain.vercel.app/hero.png',
      description: `I just earned a ${visit.placeId} Proof of Visit badge on Tourism Chain Nepal. Verify my visit on the blockchain!`,
      label: 'Verify Visit',
      links: {
        actions: [
          {
            label: 'Support this Heritage Site (0.01 SOL)',
            href: `/api/actions/support/${visit.placeId}`,
          }
        ]
      }
    };
    
    res.set(ACTIONS_CORS_HEADERS).json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// OPTIONS handler for CORS
router.options('/share-visit/:visitId', (req, res) => {
    res.set(ACTIONS_CORS_HEADERS).send();
});

// POST /api/actions/support/:placeId
// Returns a transaction to donate to a heritage site
router.post('/support/:placeId', async (req, res) => {
    try {
        const { account } = req.body;
        if (!account) return res.status(400).json({ error: 'Account is required' });

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(account),
                toPubkey: new PublicKey('2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy'), // Project Treasury
                lamports: 0.01 * LAMPORTS_PER_SOL,
            })
        );
        
        transaction.feePayer = new PublicKey(account);
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const payload = {
            transaction: transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
            message: `Thank you for supporting heritage conservation at ${req.params.placeId}!`,
        };

        res.set(ACTIONS_CORS_HEADERS).json(payload);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
