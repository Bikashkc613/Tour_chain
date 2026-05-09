# Guide Wallet Setup - Enable Escrow Payments

## Overview

As a guide on TourChain, you need to link your Solana wallet to enable **escrow payments** from tourists. This allows tourists to lock their payment in a trustless smart contract that automatically releases funds as trek milestones are completed.

## Why Link Your Wallet?

### Benefits:
- ✅ **Trustless Payments**: Funds are held on-chain, not by a middleman
- ✅ **Automatic Release**: Payment releases automatically when milestones are verified
- ✅ **Tourist Confidence**: Tourists feel safer booking with escrow-enabled guides
- ✅ **Higher Bookings**: Guides with linked wallets get priority in search results
- ✅ **On-Chain Reputation**: Build verifiable reputation on Solana blockchain

### Without a Linked Wallet:
- ❌ Tourists cannot use escrow protection
- ❌ Lower booking conversion rates
- ❌ Manual payment coordination required
- ❌ No on-chain reputation building

---

## Step-by-Step Guide

### Step 1: Install a Solana Wallet

You need a Solana wallet browser extension. We recommend:

**Option A: Phantom (Recommended)**
1. Go to https://phantom.app/
2. Click "Download"
3. Install the browser extension
4. Create a new wallet or import existing one
5. **IMPORTANT**: Save your recovery phrase securely!

**Option B: Solflare**
1. Go to https://solflare.com/
2. Click "Download"
3. Install the browser extension
4. Create a new wallet
5. Save your recovery phrase

### Step 2: Get Some SOL (Devnet)

Since TourChain runs on Solana Devnet, you need devnet SOL (it's free!):

1. Copy your wallet address from Phantom/Solflare
2. Go to https://faucet.solana.com/
3. Paste your wallet address
4. Click "Confirm Airdrop"
5. Wait 10-30 seconds for the SOL to arrive

### Step 3: Link Your Wallet on TourChain

1. **Go to Guide Dashboard**:
   - Visit: http://localhost:3000/dashboard/operator
   - You should see a "Link Your Wallet" card at the top

2. **Connect Wallet**:
   - Click "Select Wallet" button
   - Choose your wallet (Phantom or Solflare)
   - Approve the connection in your wallet extension

3. **Sign the Message**:
   - Click "Link Wallet" button
   - Your wallet will ask you to sign a message
   - This proves you own the wallet address
   - Click "Sign" or "Approve" in your wallet

4. **Confirmation**:
   - You'll see "Wallet linked successfully!"
   - Your wallet address will be displayed
   - The card will turn green with a checkmark

### Step 4: Verify It's Working

1. **Check Your Profile**:
   - Your wallet address should now be visible in the dashboard
   - The status should show "Wallet Connected"

2. **Test with a Booking**:
   - Have a tourist create a booking for your service
   - They should now see the escrow option
   - The error "Guide hasn't linked their wallet" should be gone

---

## How Escrow Works

Once your wallet is linked:

1. **Tourist Books**: Tourist creates a booking and locks funds in escrow
2. **Funds Locked**: Payment is held in a Solana smart contract (PDA)
3. **Trek Starts**: You activate the trek on-chain
4. **Milestones**: As checkpoints are verified, funds release automatically:
   - 20% on booking confirmation
   - 30% when trek starts
   - 30% at halfway point
   - 20% on completion
5. **Automatic Release**: No manual payment processing needed!

---

## Troubleshooting

### "Please connect your wallet first"
- Make sure your wallet extension is installed
- Click the "Select Wallet" button
- Approve the connection in your wallet popup

### "Failed to link wallet"
- Make sure you signed the message in your wallet
- Try disconnecting and reconnecting your wallet
- Clear browser cache and try again

### "Wallet already linked to another account"
- Each wallet can only be linked to one guide account
- Use a different wallet address
- Or contact support to unlink the wallet

### Wallet not showing in dashboard
- Refresh the page
- Make sure you're logged in as a guide
- Check that you completed all linking steps

---

## Security Best Practices

### DO:
- ✅ Keep your recovery phrase offline and secure
- ✅ Never share your recovery phrase with anyone
- ✅ Use a hardware wallet for large amounts
- ✅ Verify the website URL before connecting
- ✅ Sign out of your wallet when not in use

### DON'T:
- ❌ Share your recovery phrase or private key
- ❌ Store recovery phrase digitally (screenshots, cloud, etc.)
- ❌ Connect to suspicious websites
- ❌ Sign transactions you don't understand
- ❌ Use the same wallet for multiple accounts

---

## FAQ

**Q: Do I need real SOL?**  
A: No! TourChain runs on Solana Devnet, which uses free test SOL. Get it from https://faucet.solana.com/

**Q: Can I change my linked wallet later?**  
A: Yes, but you'll need to contact support to unlink the old wallet first.

**Q: What if I lose access to my wallet?**  
A: You'll need to link a new wallet. Any pending escrow payments will need to be resolved with support.

**Q: Is my wallet address public?**  
A: Yes, wallet addresses are public on the blockchain. This is normal and safe.

**Q: Can tourists see my wallet balance?**  
A: They can see your wallet address, but not your balance or transaction history (unless they look on a blockchain explorer).

**Q: Do I pay gas fees?**  
A: Yes, but on Solana Devnet they're extremely low (fractions of a cent). On mainnet, fees are typically $0.00025 per transaction.

---

## Need Help?

- **Technical Issues**: Check the browser console for errors
- **Wallet Problems**: Visit your wallet provider's support
- **TourChain Support**: Contact support@tourchain.com

---

## Summary

1. Install Phantom or Solflare wallet
2. Get free devnet SOL from faucet
3. Go to Guide Dashboard
4. Click "Select Wallet" and connect
5. Click "Link Wallet" and sign the message
6. Done! You can now receive escrow payments

Your wallet is now linked and tourists can use escrow protection when booking with you! 🎉
