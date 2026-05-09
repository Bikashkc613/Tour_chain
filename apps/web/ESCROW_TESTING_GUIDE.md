# Escrow Testing Guide - Lock Funds On-Chain

## Overview

This guide will help you test the complete escrow locking feature on TourChain. The escrow system uses a Solana smart contract to hold funds in a trustless manner until trek milestones are completed.

---

## Prerequisites

Before testing escrow, you need:

### 1. **Solana Wallet with Devnet SOL**
- ✅ Phantom or Solflare wallet installed
- ✅ At least 0.1 SOL on Devnet (for testing)
- ✅ Get free devnet SOL: https://faucet.solana.com/

### 2. **Two Wallets (for full testing)**
- **Wallet A**: Tourist (books and locks funds)
- **Wallet B**: Guide (receives milestone payments)

### 3. **Guide Must Have Linked Wallet**
- Guide must link their wallet in the dashboard
- See `GUIDE_WALLET_SETUP.md` for instructions

---

## Escrow Program Details

**Program ID**: `B1M6gHx7W2tKPWwEEuKaumyk2H8zdETZGoBCDt9yamrt`  
**Network**: Solana Devnet  
**RPC**: https://api.devnet.solana.com

### Program Features:
- ✅ Milestone-based payments (1-10 milestones)
- ✅ Automatic fund release on completion
- ✅ Dispute resolution system
- ✅ Cancellation with refund
- ✅ On-chain event logging

---

## Step-by-Step Testing

### Step 1: Setup Guide Wallet

1. **Login as Guide**:
   ```
   Go to: http://localhost:3000/dashboard/operator
   ```

2. **Link Wallet**:
   - Click "Select Wallet"
   - Choose Phantom/Solflare
   - Approve connection
   - Click "Link Wallet"
   - Sign the message
   - ✅ Wallet linked!

3. **Verify**:
   - Card should turn green
   - Wallet address displayed
   - Status: "Wallet Connected"

---

### Step 2: Create a Booking (as Tourist)

1. **Browse Routes**:
   ```
   Go to: http://localhost:3000/explore
   ```

2. **Select a Route**:
   - Click on any route card
   - Click "Book Now"

3. **Fill Booking Details**:
   - Select a service package
   - Choose start date
   - Add any add-ons (optional)
   - Click through the booking steps

4. **Submit Booking**:
   - Click "Confirm Booking"
   - ✅ Booking created!
   - You'll see booking confirmation page

---

### Step 3: Lock Funds in Escrow

After booking confirmation, you'll see the **Escrow Panel**:

#### 3.1 Connect Your Wallet (Tourist)

If not connected:
- Click "Select Wallet"
- Choose your wallet
- Approve connection

#### 3.2 Review Escrow Details

The panel shows:
- **Amount to Lock**: e.g., 0.0234 SOL (≈ $350 USD)
- **Milestone Schedule**:
  - 20% on booking confirmation
  - 30% when trek starts
  - 30% at halfway point
  - 20% on completion

#### 3.3 Lock Funds

1. **Click "Lock X SOL in Escrow"**
2. **Wallet Popup Appears**:
   - Review transaction details
   - Check amount and recipient
   - Gas fee: ~0.00001 SOL

3. **Approve Transaction**:
   - Click "Approve" or "Confirm"
   - Wait 5-10 seconds for confirmation

4. **Success!**:
   - ✅ Green success message
   - Transaction hash displayed
   - Link to Solana Explorer

---

### Step 4: Verify Escrow on Blockchain

1. **Click "Explorer" Link**:
   - Opens Solana Explorer
   - Shows transaction details

2. **Check Transaction**:
   - Status: "Success" ✅
   - Program: `B1M6gH...yamrt`
   - Instruction: `createEscrow`

3. **View Escrow Account**:
   - Copy escrow PDA address
   - Paste in Solana Explorer
   - See locked funds

---

## What Happens After Locking?

### Escrow States:

```
┌─────────────────────────────────────────────────────────────┐
│  ESCROW LIFECYCLE                                           │
└─────────────────────────────────────────────────────────────┘

1. FUNDED (Initial State)
   └─> Funds locked in vault
   └─> Waiting for guide to activate

2. ACTIVE (Guide Activates)
   └─> Trek has started
   └─> Milestones can be released

3. MILESTONE RELEASES
   └─> Guide + Tourist sign together
   └─> Funds transfer to guide
   └─> Repeat for each milestone

4. COMPLETED
   └─> All milestones released
   └─> Final payment to guide
   └─> Escrow closed

Alternative Paths:
- DISPUTED → Admin resolves
- CANCELLED → Refund to tourist
```

---

## Testing Milestone Releases

### Prerequisites:
- Escrow must be in "Active" state
- Both tourist and guide must sign

### Steps:

1. **Guide Activates Escrow**:
   ```typescript
   // Guide calls activate() on the program
   // This changes status from Funded → Active
   ```

2. **Release First Milestone**:
   ```typescript
   // Both tourist and guide sign
   // 20% of funds transfer to guide
   ```

3. **Continue Releasing**:
   - Repeat for each milestone
   - Each release requires both signatures
   - Funds transfer immediately

---

## Common Issues & Solutions

### Issue: "Please connect your Solana wallet first"
**Solution**: 
- Install Phantom or Solflare
- Click "Select Wallet" button
- Approve connection

### Issue: "Guide hasn't linked their wallet yet"
**Solution**:
- Guide must link wallet in dashboard
- See `GUIDE_WALLET_SETUP.md`
- Verify wallet address is saved

### Issue: "Insufficient funds"
**Solution**:
- Get devnet SOL from faucet
- Need at least booking amount + 0.01 SOL for fees
- Visit: https://faucet.solana.com/

### Issue: "Transaction failed"
**Solution**:
- Check wallet has enough SOL
- Verify you're on Devnet
- Try again (might be network congestion)
- Check browser console for errors

### Issue: "Program error"
**Solution**:
- Verify program is deployed on Devnet
- Check program ID matches: `B1M6gH...yamrt`
- Ensure IDL file is up to date

---

## Debugging Tips

### Check Browser Console:
```javascript
// Open DevTools (F12)
// Look for errors in Console tab
// Common errors:
// - "Program not found" → Wrong network
// - "Insufficient funds" → Need more SOL
// - "Invalid signature" → Wallet not connected
```

### Check Network Tab:
```
// See API calls
// Verify booking was created
// Check guide wallet was fetched
```

### Check Solana Explorer:
```
https://explorer.solana.com/?cluster=devnet

// Search for:
// - Your wallet address
// - Transaction signature
// - Escrow PDA address
// - Program ID
```

---

## Expected Behavior

### ✅ Success Flow:

1. **Booking Created**:
   - Database record created
   - Booking ID generated
   - Confirmation page shown

2. **Escrow Panel Visible**:
   - Shows amount to lock
   - Displays milestone schedule
   - "Lock Funds" button enabled

3. **Transaction Submitted**:
   - Wallet popup appears
   - User approves
   - Transaction sent to blockchain

4. **Confirmation**:
   - Success message shown
   - Transaction hash displayed
   - Explorer link available

5. **Funds Locked**:
   - SOL transferred from tourist wallet
   - Held in escrow vault PDA
   - Visible on Solana Explorer

---

## Testing Checklist

- [ ] Guide wallet linked successfully
- [ ] Booking created without errors
- [ ] Escrow panel displays correctly
- [ ] Wallet connection works
- [ ] Amount calculation is correct
- [ ] Milestone schedule shows properly
- [ ] "Lock Funds" button clickable
- [ ] Wallet popup appears
- [ ] Transaction approves successfully
- [ ] Success message displays
- [ ] Transaction hash shown
- [ ] Explorer link works
- [ ] Funds visible in escrow on-chain
- [ ] Booking status updated

---

## Advanced Testing

### Test Cancellation:
```typescript
// Tourist can cancel before activation
// Funds return to tourist
// Escrow closed
```

### Test Disputes:
```typescript
// Either party can open dispute
// Admin resolves with split percentage
// Funds distributed accordingly
```

### Test Complete Flow:
```typescript
// 1. Create escrow
// 2. Guide activates
// 3. Release milestone 1
// 4. Release milestone 2
// 5. Release milestone 3
// 6. Complete booking
// 7. Verify all funds transferred
```

---

## Monitoring Escrow

### View Escrow State:
```bash
# Using Solana CLI
solana account <ESCROW_PDA> --url devnet

# Or use Anchor
anchor account BookingEscrow <ESCROW_PDA> --provider.cluster devnet
```

### Check Vault Balance:
```bash
solana balance <VAULT_PDA> --url devnet
```

### View Program Logs:
```bash
solana logs <PROGRAM_ID> --url devnet
```

---

## Summary

The escrow system provides:
- ✅ Trustless payment holding
- ✅ Milestone-based releases
- ✅ Dispute resolution
- ✅ Automatic fund transfers
- ✅ On-chain verification
- ✅ Tourist protection
- ✅ Guide payment guarantee

Test thoroughly on Devnet before mainnet deployment!

---

## Need Help?

- **Solana Docs**: https://docs.solana.com/
- **Anchor Docs**: https://www.anchor-lang.com/
- **Phantom Support**: https://phantom.app/help
- **TourChain Support**: Check browser console for errors

Happy testing! 🚀
