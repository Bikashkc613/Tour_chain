use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111"); // Placeholder, will update with `anchor keys list`

#[program]
pub mod route_registry {
    use super::*;

    pub fn register_route(
        ctx: Context<RegisterRoute>,
        name: String,
        region: String,
        difficulty: String,
        metadata_uri: String,
    ) -> Result<()> {
        let route = &mut ctx.accounts.route_account;
        route.name = name;
        route.region = region;
        route.difficulty = difficulty;
        route.metadata_uri = metadata_uri;
        route.creator = ctx.accounts.creator.key();
        route.total_completions = 0;
        route.num_checkpoints = 5; // Default for demo
        route.bump = ctx.bumps.route_account;
        Ok(())
    }

    pub fn check_in(
        ctx: Context<CheckIn>,
        checkpoint_id: u8,
        gps_proof: [u8; 32],
    ) -> Result<()> {
        let checkpoint = &mut ctx.accounts.checkpoint_account;
        checkpoint.tourist = ctx.accounts.tourist.key();
        checkpoint.route_id = ctx.accounts.route_account.key();
        checkpoint.checkpoint_id = checkpoint_id;
        checkpoint.timestamp = Clock::get()?.unix_timestamp;
        
        // This is where a CPI to Bubblegum would mint a cNFT badge
        
        emit!(CheckInEvent {
            tourist: ctx.accounts.tourist.key(),
            route_id: ctx.accounts.route_account.key(),
            checkpoint_id,
            timestamp: checkpoint.timestamp,
        });
        Ok(())
    }

    pub fn complete_route(ctx: Context<CompleteRoute>) -> Result<()> {
        let completion = &mut ctx.accounts.completion_account;
        let route = &mut ctx.accounts.route_account;
        
        completion.tourist = ctx.accounts.tourist.key();
        completion.route_id = route.key();
        completion.completed_at = Clock::get()?.unix_timestamp;
        
        route.total_completions += 1;
        
        // This is where a "Summit" NFT would be minted via CPI
        
        Ok(())
    }
}

#[account]
pub struct RouteAccount {
    pub name: String,
    pub region: String,
    pub difficulty: String,
    pub metadata_uri: String,
    pub creator: Pubkey,
    pub total_completions: u64,
    pub num_checkpoints: u8,
    pub bump: u8,
}

#[account]
pub struct CheckpointAccount {
    pub tourist: Pubkey,
    pub route_id: Pubkey,
    pub checkpoint_id: u8,
    pub timestamp: i64,
}

#[account]
pub struct RouteCompletionAccount {
    pub tourist: Pubkey,
    pub route_id: Pubkey,
    pub completed_at: i64,
}

#[event]
pub struct CheckInEvent {
    pub tourist: Pubkey,
    pub route_id: Pubkey,
    pub checkpoint_id: u8,
    pub timestamp: i64,
}

#[derive(Accounts)]
pub struct RegisterRoute<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + (4 + 100) + (4 + 100) + (4 + 50) + (4 + 200) + 32 + 8 + 1 + 1,
        seeds = [b"route", name.as_bytes()],
        bump
    )]
    pub route_account: Account<'info, RouteAccount>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(checkpoint_id: u8, gps_proof: [u8; 32])]
pub struct CheckIn<'info> {
    #[account(
        init,
        payer = tourist,
        space = 8 + 32 + 32 + 1 + 8,
        seeds = [b"checkpoint", tourist.key().as_ref(), route_account.key().as_ref(), &[checkpoint_id]],
        bump
    )]
    pub checkpoint_account: Account<'info, CheckpointAccount>,
    pub route_account: Account<'info, RouteAccount>,
    #[account(mut)]
    pub tourist: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteRoute<'info> {
    #[account(
        init,
        payer = tourist,
        space = 8 + 32 + 32 + 8,
        seeds = [b"completion", tourist.key().as_ref(), route_account.key().as_ref()],
        bump
    )]
    pub completion_account: Account<'info, RouteCompletionAccount>,
    #[account(mut)]
    pub route_account: Account<'info, RouteAccount>,
    #[account(mut)]
    pub tourist: Signer<'info>,
    pub system_program: Program<'info, System>,
}
