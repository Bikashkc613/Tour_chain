use anchor_lang::prelude::*;

declare_id!("2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy"); // will be generated automatically

#[program]
pub mod tourism_chain {
    use super::*;

    // Initialize a tourist account
    pub fn initialize_tourist(ctx: Context<InitializeTourist>) -> Result<()> {
        let tourist = &mut ctx.accounts.tourist_account;
        tourist.wallet = ctx.accounts.user.key();
        tourist.total_visits = 0;
        tourist.bump = ctx.bumps.tourist_account;
        Ok(())
    }

    // Record a visit (called by backend after QR verification)
    pub fn record_visit(
        ctx: Context<RecordVisit>,
        place_id: String,
    ) -> Result<()> {
        let tourist = &mut ctx.accounts.tourist_account;
        tourist.total_visits += 1;
        
        // Emit an event so the frontend can listen
        emit!(VisitRecorded {
            tourist: ctx.accounts.user.key(),
            place_id,
            total_visits: tourist.total_visits,
        });
        Ok(())
    }
}

// The tourist's on-chain account structure
#[account]
pub struct TouristAccount {
    pub wallet: Pubkey,     // tourist's wallet address
    pub total_visits: u32,  // how many places visited
    pub bump: u8,
}

// Events (emitted for frontend to listen to)
#[event]
pub struct VisitRecorded {
    pub tourist: Pubkey,
    pub place_id: String,
    pub total_visits: u32,
}

// Account validation for initialize_tourist
#[derive(Accounts)]
pub struct InitializeTourist<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 4 + 1,
        seeds = [b"tourist", user.key().as_ref()],
        bump
    )]
    pub tourist_account: Account<'info, TouristAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RecordVisit<'info> {
    #[account(
        mut,
        seeds = [b"tourist", user.key().as_ref()],
        bump = tourist_account.bump
    )]
    pub tourist_account: Account<'info, TouristAccount>,
    pub user: Signer<'info>,
}
