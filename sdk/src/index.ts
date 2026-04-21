import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

export class TourismChain {
  public provider: AnchorProvider;
  public connection: Connection;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });
  }

  // Program Instance Getters
  getRegistryProgram(programId: PublicKey) {
    return new Program({} as Idl, this.provider);
  }

  getBookingProgram(programId: PublicKey) {
    return new Program({} as Idl, this.provider);
  }

  getCarbonProgram(programId: PublicKey) {
    return new Program({} as Idl, this.provider);
  }

  getPricingProgram(programId: PublicKey) {
    return new Program({} as Idl, this.provider);
  }

  getSOSProgram(programId: PublicKey) {
    return new Program({} as Idl, this.provider);
  }

  getGovernanceProgram(programId: PublicKey) {
    return new Program({} as Idl, this.provider);
  }

  // Helper: Submit Review
  async submitReview(operator: PublicKey, rating: number, comment: string) {
    const registry = this.getRegistryProgram(new PublicKey("2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy"));
    return await registry.methods.submitReview(rating, comment).accounts({
      operatorAccount: operator,
      tourist: this.provider.publicKey,
    }).rpc();
  }

  // Helper: Release Milestone
  async releaseMilestone(booking: PublicKey, milestoneIndex: number) {
    const bookingProgram = this.getBookingProgram(new PublicKey("11111111111111111111111111111111"));
    return await bookingProgram.methods.releaseMilestone(milestoneIndex).accounts({
      bookingAccount: booking,
      operator: this.provider.publicKey,
    }).rpc();
  }

  // Helper: Trigger SOS
  async triggerSOS(lat: string, long: string, altitude: number) {
    const sosProgram = this.getSOSProgram(new PublicKey("11111111111111111111111111111111"));
    return await sosProgram.methods.triggerSos(lat, long, altitude).accounts({
      tourist: this.provider.publicKey,
    }).rpc();
  }

  // Helper: DAO Governance
  async createProposal(title: string, description: string, type: any) {
    const govProgram = this.getGovernanceProgram(new PublicKey("11111111111111111111111111111111"));
    return await govProgram.methods.createProposal(title, description, type).accounts({
      proposer: this.provider.publicKey,
    }).rpc();
  }

  async castVote(proposal: PublicKey, voteFor: boolean, weight: number) {
    const govProgram = this.getGovernanceProgram(new PublicKey("11111111111111111111111111111111"));
    return await govProgram.methods.castVote(voteFor, weight).accounts({
      proposal: proposal,
      voter: this.provider.publicKey,
    }).rpc();
  }
}

export * from "./operator";
export * from "./booking";
export * from "./nft";
export * from "./route";
