use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod carbon_credits {
    use super::*;

    pub fn mint_offset(
        ctx: Context<MintOffset>,
        booking_id: Pubkey,
        distance_km: u64,
        transport_type: u8, // 0: Flight, 1: Bus, 2: Trekking
    ) -> Result<()> {
        let offset = &mut ctx.accounts.offset_account;
        
        // Simple footprint calculation (kg CO2)
        let footprint = match transport_type {
            0 => distance_km * 250 / 1000, // 0.25kg per km
            1 => distance_km * 50 / 1000,  // 0.05kg per km
            _ => distance_km * 10 / 1000,  // 0.01kg per km (minimal for trekking)
        };
        
        offset.booking_id = booking_id;
        offset.amount = footprint;
        offset.retired = false;
        offset.timestamp = Clock::get()?.unix_timestamp;
        
        emit!(OffsetMintedEvent {
            booking_id,
            amount: footprint,
        });
        
        Ok(())
    }

    pub fn retire_offset(ctx: Context<RetireOffset>) -> Result<()> {
        let offset = &mut ctx.accounts.offset_account;
        require!(!offset.retired, CarbonError::AlreadyRetired);
        
        offset.retired = true;
        
        emit!(OffsetRetiredEvent {
            booking_id: offset.booking_id,
            amount: offset.amount,
        });
        
        Ok(())
    }
}

#[account]
pub struct OffsetAccount {
    pub booking_id: Pubkey,
    pub amount: u64, // in kg CO2
    pub retired: bool,
    pub timestamp: i64,
}

#[event]
pub struct OffsetMintedEvent {
    pub booking_id: Pubkey,
    pub amount: u64,
}

#[event]
pub struct OffsetRetiredEvent {
    pub booking_id: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum CarbonError {
    #[msg("This offset has already been retired.")]
    AlreadyRetired,
}

#[derive(Accounts)]
#[instruction(booking_id: Pubkey, distance_km: u64, transport_type: u8)]
pub struct MintOffset<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 1 + 8,
        seeds = [b"offset", booking_id.as_ref()],
        bump
    )]
    pub offset_account: Account<'info, OffsetAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RetireOffset<'info> {
    #[account(mut)]
    pub offset_account: Account<'info, OffsetAccount>,
    pub authority: Signer<'info>,
}
