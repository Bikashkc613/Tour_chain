use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod experience_nft {
    use super::*;

    pub fn mint_experience_nft(
        ctx: Context<MintExperienceNFT>,
        metadata: ExperienceMetadata,
    ) -> Result<()> {
        // Logic for Metaplex Bubblegum minting goes here
        // This usually involves calling the bubblegum program via CPI
        emit!(NFTMintedEvent {
            tourist: ctx.accounts.tourist.key(),
            operator: ctx.accounts.operator.key(),
            trail: metadata.trail,
        });
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ExperienceMetadata {
    pub trail: String,
    pub altitude: u64,
    pub date: i64,
    pub weather: String,
}

#[event]
pub struct NFTMintedEvent {
    pub tourist: Pubkey,
    pub operator: Pubkey,
    pub trail: String,
}

#[derive(Accounts)]
pub struct MintExperienceNFT<'info> {
    #[account(mut)]
    pub tourist: Signer<'info>,
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
    // Add Bubblegum-specific accounts: tree_authority, leaf_owner, leaf_delegate, merging_tree, etc.
}
