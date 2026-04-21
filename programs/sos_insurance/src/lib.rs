use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod sos_insurance {
    use super::*;

    pub fn trigger_sos(
        ctx: Context<TriggerSOS>,
        gps_lat: String,
        gps_long: String,
        altitude: u32,
    ) -> Result<()> {
        let alert = &mut ctx.accounts.emergency_alert;
        alert.tourist = ctx.accounts.tourist.key();
        alert.lat = gps_lat;
        alert.long = gps_long;
        alert.altitude = altitude;
        alert.timestamp = Clock::get()?.unix_timestamp;
        alert.is_resolved = false;
        alert.is_paid_out = false;
        
        emit!(SOSTriggeredEvent {
            tourist: alert.tourist,
            timestamp: alert.timestamp,
        });
        
        Ok(())
    }

    pub fn payout_insurance(ctx: Context<PayoutInsurance>) -> Result<()> {
        let alert = &mut ctx.accounts.emergency_alert;
        require!(!alert.is_paid_out, InsuranceError::AlreadyPaidOut);
        
        // Parametric check: if altitude > 5000 and weather is 'extreme' (from oracle)
        // For demo: auto-payout if altitude > 5000
        require!(alert.altitude > 5000, InsuranceError::ThresholdNotMet);
        
        alert.is_paid_out = true;
        alert.is_resolved = true;
        
        emit!(InsurancePayoutEvent {
            tourist: alert.tourist,
            amount: 500_000_000, // 500 USDC
        });
        
        Ok(())
    }
}

#[account]
pub struct EmergencyAlert {
    pub tourist: Pubkey,
    pub lat: String,
    pub long: String,
    pub altitude: u32,
    pub timestamp: i64,
    pub is_resolved: bool,
    pub is_paid_out: bool,
}

#[event]
pub struct SOSTriggeredEvent {
    pub tourist: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct InsurancePayoutEvent {
    pub tourist: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum InsuranceError {
    #[msg("Insurance threshold not met.")]
    ThresholdNotMet,
    #[msg("Insurance already paid out for this alert.")]
    AlreadyPaidOut,
}

#[derive(Accounts)]
#[instruction(gps_lat: String, gps_long: String, altitude: u32)]
pub struct TriggerSOS<'info> {
    #[account(
        init,
        payer = tourist,
        space = 8 + 32 + 50 + 50 + 4 + 8 + 1 + 1,
        seeds = [b"sos", tourist.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub emergency_alert: Account<'info, EmergencyAlert>,
    #[account(mut)]
    pub tourist: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayoutInsurance<'info> {
    #[account(mut)]
    pub emergency_alert: Account<'info, EmergencyAlert>,
    #[account(mut)]
    pub authority: Signer<'info>, // Admin/Oracle authority
}
