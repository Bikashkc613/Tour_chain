use anchor_lang::prelude::*;

declare_id!("BxgSbUELdL9cCj4hETtFJqyzDqFeRKAYefWBnVpDXk3L");

#[program]
pub mod tourchain_reputation {
    use super::*;

    pub fn initialize_guide(ctx: Context<InitializeGuide>, name: [u8; 64]) -> Result<()> {
        let rep = &mut ctx.accounts.guide_reputation;
        rep.authority = ctx.accounts.guide.key();
        rep.admin = ctx.accounts.admin.key();
        rep.name = name;
        rep.total_reviews = 0;
        rep.total_score = 0;
        rep.completed_treks = 0;
        rep.active_since = Clock::get()?.unix_timestamp;
        rep.is_verified = true;
        rep.is_suspended = false;
        rep.last_updated = Clock::get()?.unix_timestamp;
        rep.bump = ctx.bumps.guide_reputation;

        emit!(GuideRegistered {
            guide: rep.authority,
            admin: rep.admin,
            active_since: rep.active_since,
        });
        Ok(())
    }

    pub fn update_reputation(ctx: Context<AdminAction>, score: u8) -> Result<()> {
        require!(score >= 1 && score <= 5, ReputationError::InvalidScore);
        let rep = &mut ctx.accounts.guide_reputation;
        require!(!rep.is_suspended, ReputationError::GuideSuspended);

        rep.total_reviews = rep.total_reviews.checked_add(1).ok_or(ReputationError::Overflow)?;
        rep.total_score = rep
            .total_score
            .checked_add((score as u64).checked_mul(100).ok_or(ReputationError::Overflow)?)
            .ok_or(ReputationError::Overflow)?;
        rep.completed_treks = rep.completed_treks.checked_add(1).ok_or(ReputationError::Overflow)?;
        rep.last_updated = Clock::get()?.unix_timestamp;

        emit!(ReputationUpdated {
            guide: rep.authority,
            score,
            total_reviews: rep.total_reviews,
            total_score: rep.total_score,
        });
        Ok(())
    }

    pub fn suspend_guide(ctx: Context<AdminAction>) -> Result<()> {
        let rep = &mut ctx.accounts.guide_reputation;
        rep.is_suspended = true;
        rep.last_updated = Clock::get()?.unix_timestamp;
        emit!(GuideSuspended { guide: rep.authority });
        Ok(())
    }

    pub fn reinstate_guide(ctx: Context<AdminAction>) -> Result<()> {
        let rep = &mut ctx.accounts.guide_reputation;
        rep.is_suspended = false;
        rep.last_updated = Clock::get()?.unix_timestamp;
        emit!(GuideReinstated { guide: rep.authority });
        Ok(())
    }
}

// 8 + 32 + 32 + 64 + 4 + 8 + 4 + 8 + 1 + 1 + 8 + 1 = 171
#[account]
pub struct GuideReputation {
    pub authority: Pubkey,
    pub admin: Pubkey,
    pub name: [u8; 64],
    pub total_reviews: u32,
    pub total_score: u64,
    pub completed_treks: u32,
    pub active_since: i64,
    pub is_verified: bool,
    pub is_suspended: bool,
    pub last_updated: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeGuide<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 64 + 4 + 8 + 4 + 8 + 1 + 1 + 8 + 1,
        seeds = [b"guide", guide.key().as_ref()],
        bump
    )]
    pub guide_reputation: Account<'info, GuideReputation>,
    /// CHECK: guide wallet — just a public key target for the PDA
    pub guide: AccountInfo<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(
        mut,
        seeds = [b"guide", guide_reputation.authority.as_ref()],
        bump = guide_reputation.bump,
        constraint = guide_reputation.admin == admin.key() @ ReputationError::UnauthorizedAdmin
    )]
    pub guide_reputation: Account<'info, GuideReputation>,
    pub admin: Signer<'info>,
}

#[event]
pub struct GuideRegistered {
    pub guide: Pubkey,
    pub admin: Pubkey,
    pub active_since: i64,
}

#[event]
pub struct ReputationUpdated {
    pub guide: Pubkey,
    pub score: u8,
    pub total_reviews: u32,
    pub total_score: u64,
}

#[event]
pub struct GuideSuspended {
    pub guide: Pubkey,
}

#[event]
pub struct GuideReinstated {
    pub guide: Pubkey,
}

#[error_code]
pub enum ReputationError {
    #[msg("Caller is not the registered admin")]
    UnauthorizedAdmin,
    #[msg("Guide is suspended")]
    GuideSuspended,
    #[msg("Score must be between 1 and 5")]
    InvalidScore,
    #[msg("Arithmetic overflow")]
    Overflow,
}
