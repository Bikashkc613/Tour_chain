import { readFileSync, appendFileSync, existsSync } from "fs";
import { resolve } from "path";

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseKeypair(): Uint8Array {
  const keypairPath = getEnv("ANCHOR_WALLET");
  const abs = resolve(keypairPath);
  if (!existsSync(abs)) {
    throw new Error(`ANCHOR_WALLET not found: ${abs}`);
  }
  const raw = JSON.parse(readFileSync(abs, "utf8")) as number[];
  return new Uint8Array(raw);
}

async function run() {
  const rpc = process.env.SOLANA_RPC ?? process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com";
  const secret = parseKeypair();

  const { createUmi } = await import("@metaplex-foundation/umi-bundle-defaults");
  const { signerIdentity, generateSigner } = await import("@metaplex-foundation/umi");
  const {
    mplBubblegum,
    createTree,
  } = await import("@metaplex-foundation/mpl-bubblegum");
  const { fromWeb3JsKeypair } = await import("@metaplex-foundation/umi-web3js-adapters");
  const web3 = await import("@solana/web3.js");

  const keypair = web3.Keypair.fromSecretKey(secret);
  const connection = new web3.Connection(rpc, "confirmed");
  const balance = await connection.getBalance(keypair.publicKey);
  if (balance < 2 * web3.LAMPORTS_PER_SOL) {
    throw new Error("Need at least 2 SOL before tree initialization");
  }

  const umi = createUmi(rpc).use(mplBubblegum());
  const umiSigner = fromWeb3JsKeypair(keypair);
  umi.use(signerIdentity(umiSigner));

  const merkleTree = generateSigner(umi);
  await createTree(umi, {
    merkleTree,
    maxDepth: 14,
    maxBufferSize: 64,
    canopyDepth: 0,
  }).sendAndConfirm(umi);

  const treeAddress = merkleTree.publicKey.toString();
  const envPath = resolve("apps/web/.env.local");
  appendFileSync(envPath, `\nNEXT_PUBLIC_MERKLE_TREE=${treeAddress}\n`);
  console.log(`Merkle tree created: ${treeAddress}`);
  console.log(`Appended NEXT_PUBLIC_MERKLE_TREE to ${envPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
