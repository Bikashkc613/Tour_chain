import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TourismChain } from "./index";

export class RouteRegistry {
  private sdk: TourismChain;
  private program: any;

  constructor(sdk: TourismChain, programId: PublicKey) {
    this.sdk = sdk;
    this.program = sdk.getRegistryProgram(programId);
  }

  async checkIn(routeId: PublicKey, gpsProof: Uint8Array) {
    // In a real app, we would verify the ZK proof here or in the circuit
    return await this.program.methods
      .checkIn(routeId, Array.from(gpsProof))
      .accounts({
        tourist: this.sdk.provider.publicKey,
      })
      .rpc();
  }

  async registerRoute(
    name: string,
    region: string,
    difficulty: string,
    metadataUri: string
  ) {
    const [routePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("route"), Buffer.from(name)],
      this.program.programId
    );

    return await this.program.methods
      .registerRoute(name, region, difficulty, metadataUri)
      .accounts({
        routeAccount: routePda,
        creator: this.sdk.provider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }
}
