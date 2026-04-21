use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod loyalty_token {
    use super::*;

    pub fn earn_trek(ctx: Context<EarnTrek>, amount: u64) -> Result<()> {
        // Logic to mint TREK tokens to tourist's account
        // Usually requires a minter authority PDA
        Ok(())
    }

    pub fn stake_trek(ctx: Context<StakeTrek>, amount: u64, duration: i64) -> Result<()> {
        let stake = &mut ctx.accounts.stake_account;
        stake.owner = ctx.accounts.owner.key();
        stake.amount += amount;
        stake.start_time = Clock::get()?.unix_timestamp;
        stake.end_time = stake.start_time + duration;
        stake.bump = ctx.bumps.stake_account;
        
        // Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.owner_token_account.to_account_info(),
                    to: ctx.accounts.vault_token_account.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;
        
        Ok(())
    }

    pub fn unstake_trek(ctx: Context<UnstakeTrek>) -> Result<()> {
        let stake = &mut ctx.accounts.stake_account;
        require!(Clock::get()?.unix_timestamp >= stake.end_time, LoyaltyError::StakeLocked);
        
        let amount = stake.amount;
        
        // Transfer tokens back to owner
        // (Signer would be a vault PDA in a real implementation)
        
        stake.amount = 0;
        Ok(())
    }
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct EarnTrek<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub tourist_token_account: Account<'info, TokenAccount>,
    pub minter_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeTrek<'info> {
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + 32 + 8 + 8 + 8 + 1,
        seeds = [b"stake", owner.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeTrek<'info> {
    #[account(mut, seeds = [b"stake", owner.key().as_ref()], bump = stake_account.bump)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum LoyaltyError {
    #[msg("Staking period has not yet ended.")]
    StakeLocked,
}
