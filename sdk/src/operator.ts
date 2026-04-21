import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TourismChain } from "./index";
import { BN } from "@coral-xyz/anchor";

export class OperatorRegistry {
  private sdk: TourismChain;
  private program: any;

  constructor(sdk: TourismChain, programId: PublicKey) {
    this.sdk = sdk;
    this.program = sdk.getRegistryProgram(programId);
  }

  async registerOperator(
    name: string,
    category: number,
    metadataUri: string,
    stakeAmount: number
  ) {
    const [operatorPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("operator"), this.sdk.provider.publicKey.toBuffer()],
      this.program.programId
    );

    return await this.program.methods
      .registerOperator(name, { [category]: {} }, metadataUri, new BN(stakeAmount))
      .accounts({
        operatorAccount: operatorPda,
        authority: this.sdk.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }

  async getOperator(authority: PublicKey) {
    const [operatorPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("operator"), authority.toBuffer()],
      this.program.programId
    );
    return await this.program.account.operatorAccount.fetch(operatorPda);
  }
}
