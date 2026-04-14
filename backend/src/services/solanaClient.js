const anchor = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey("2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy");

// Initialize tourist account on-chain
async function initializeTourist(provider, userWallet) {
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const [touristAccountPDA] = await PublicKey.findProgramAddress(
    [Buffer.from("tourist"), userWallet.publicKey.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .initializeTourist()
    .accounts({
      touristAccount: touristAccountPDA,
      user: userWallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([userWallet])
    .rpc();

  console.log("Initialize tx:", tx);
  return touristAccountPDA;
}

// Record a visit on-chain
async function recordVisit(provider, userWallet, placeId) {
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const [touristAccountPDA] = await PublicKey.findProgramAddress(
    [Buffer.from("tourist"), userWallet.publicKey.toBuffer()],
    program.programId
  );

  const tx = await program.methods
    .recordVisit(placeId)
    .accounts({
      touristAccount: touristAccountPDA,
      user: userWallet.publicKey,
    })
    .signers([userWallet])
    .rpc();

  console.log("Record visit tx:", tx);
  return tx;
}

// Get tourist account data
async function getTouristData(provider, walletAddress) {
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const [touristAccountPDA] = await PublicKey.findProgramAddress(
    [Buffer.from("tourist"), new PublicKey(walletAddress).toBuffer()],
    program.programId
  );

  try {
    const account = await program.account.touristAccount.fetch(touristAccountPDA);
    return account;
  } catch (err) {
    console.error("Tourist account not found:", err);
    return null;
  }
}

// IDL (comes from target/idl/tourism_chain.json after building)
const IDL = {
  version: "0.1.0",
  name: "tourism_chain",
  instructions: [
    {
      name: "initializeTourist",
      accounts: [
        { name: "touristAccount", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "recordVisit",
      accounts: [
        { name: "touristAccount", isMut: true, isSigner: false },
        { name: "user", isMut: false, isSigner: true },
      ],
      args: [{ name: "placeId", type: "string" }],
    },
  ],
  accounts: [
    {
      name: "TouristAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "wallet", type: "publicKey" },
          { name: "totalVisits", type: "u32" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  events: [
    {
      name: "VisitRecorded",
      fields: [
        { name: "tourist", type: "publicKey", index: true },
        { name: "placeId", type: "string", index: false },
        { name: "totalVisits", type: "u32", index: false },
      ],
    },
  ],
};

module.exports = {
  initializeTourist,
  recordVisit,
  getTouristData,
  PROGRAM_ID,
  IDL,
};
