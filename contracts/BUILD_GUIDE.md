# Building Tourism Chain Smart Contracts

The Solana smart contract has been created in Rust using Anchor framework.

## Quick Summary

**Program ID:** `2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy`

**Instructions:**
- `initialize_tourist` - Creates a tourist account
- `record_visit` - Records a visit and emits an event

## Building on Windows

Due to Windows system-level dependencies for SBF (Solana Berkeley Packet Filter), we recommend building using one of these methods:

### Option 1: WSL2 (Windows Subsystem for Linux) - RECOMMENDED
```bash
# In WSL2 terminal
cd contracts
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
curl -sSfL https://release.solana.com/stable/install | sh
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
anchor build
```

### Option 2: Docker
```bash
# Use official Solana/Anchor Docker image
docker run --rm -v $(pwd):/app -w /app gcr.io/projectserum/anchor:latest anchor build
```

### Option 3: macOS / Linux
Standard anchor build works without issues:
```bash
anchor build --skip-lint
```

## After Building

Once `anchor build` succeeds, you'll get:
- Compiled WASM binary: `target/sbf-solana-solana/release/tourism_chain.so`
- IDL file: `target/idl/tourism_chain.json` (already created)

## Testing

```bash
anchor test
```

## Deployment

```bash
# Deploy to devnet
solana airdrop 2 --url devnet
anchor deploy --provider.cluster devnet
```

The IDL file (`target/idl/tourism_chain.json`) is what your backend needs to interact with the smart contract via Anchor's client libraries.
