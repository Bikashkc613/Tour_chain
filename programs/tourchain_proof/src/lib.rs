use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod tourchain_proof {
    use super::*;

    pub fn initialize_proof_authority(
        ctx: Context<InitializeProofAuthority>,
        merkle_tree: Pubkey,
    ) -> Result<()> {
        let authority = &mut ctx.accounts.proof_authority;
        authority.admin = ctx.accounts.admin.key();
        authority.merkle_tree = merkle_tree;
        authority.total_minted = 0;
        authority.bump = ctx.bumps.proof_authority;
        Ok(())
    }

    pub fn mint_completion_proof(
        ctx: Context<MintCompletionProof>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        require!(name.len() <= 32, ProofError::NameTooLong);
        require!(symbol.len() <= 10, ProofError::SymbolTooLong);
        require!(uri.len() <= 200, ProofError::UriTooLong);

        let authority = &mut ctx.accounts.proof_authority;
        require_keys_eq!(authority.admin, ctx.accounts.admin.key(), ProofError::UnauthorizedAdmin);
        require!(authority.merkle_tree != Pubkey::default(), ProofError::TreeNotInitialized);

        authority.total_minted = authority
            .total_minted
            .checked_add(1)
            .ok_or(ProofError::Overflow)?;

        emit!(CompletionProofMinted {
            admin: ctx.accounts.admin.key(),
            recipient: ctx.accounts.recipient.key(),
            merkle_tree: authority.merkle_tree,
            name,
            symbol,
            uri,
            total_minted: authority.total_minted,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProofAuthority<'info> {
    #[account(
        init,
        payer = admin,
        space = ProofAuthority::LEN,
        seeds = [b"proof_authority"],
        bump
    )]
    pub proof_authority: Account<'info, ProofAuthority>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintCompletionProof<'info> {
    #[account(
        mut,
        seeds = [b"proof_authority"],
        bump = proof_authority.bump
    )]
    pub proof_authority: Account<'info, ProofAuthority>,
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: destination wallet for proof mint; used for event/logging.
    pub recipient: UncheckedAccount<'info>,
}

#[account]
pub struct ProofAuthority {
    pub admin: Pubkey,
    pub merkle_tree: Pubkey,
    pub total_minted: u64,
    pub bump: u8,
}

impl ProofAuthority {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1;
}

#[event]
pub struct CompletionProofMinted {
    pub admin: Pubkey,
    pub recipient: Pubkey,
    pub merkle_tree: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub total_minted: u64,
}

#[error_code]
pub enum ProofError {
    #[msg("Unauthorized admin")]
    UnauthorizedAdmin,
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Symbol too long")]
    SymbolTooLong,
    #[msg("URI too long")]
    UriTooLong,
    #[msg("Merkle tree not initialized")]
    TreeNotInitialized,
    #[msg("Arithmetic overflow")]
    Overflow,
}
