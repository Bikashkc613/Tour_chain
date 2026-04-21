use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod pricing_oracle {
    use super::*;

    pub fn get_price(
        ctx: Context<GetPrice>,
        base_price: u64,
    ) -> Result<u64> {
        let pricing_data = &ctx.accounts.pricing_data;
        let now = Clock::get()?.unix_timestamp;
        
        let mut multiplier = 100; // 1.0x base
        
        // Check for seasonal peaks (e.g., Oct-Nov and March-May in Nepal)
        // This would ideally be fed via Switchboard
        if pricing_data.is_peak_season {
            multiplier = 140; // 1.4x during peak
        }
        
        // Cap surge pricing
        if multiplier > 200 { multiplier = 200; }
        
        Ok(base_price * multiplier / 100)
    }

    pub fn update_pricing_config(
        ctx: Context<UpdatePricingConfig>,
        is_peak_season: bool,
    ) -> Result<()> {
        let pricing_data = &mut ctx.accounts.pricing_data;
        pricing_data.is_peak_season = is_peak_season;
        pricing_data.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[account]
pub struct PricingData {
    pub is_peak_season: bool,
    pub last_updated: i64,
}

#[derive(Accounts)]
pub struct GetPrice<'info> {
    pub pricing_data: Account<'info, PricingData>,
}

#[derive(Accounts)]
pub struct UpdatePricingConfig<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 1 + 8,
        seeds = [b"pricing_config"],
        bump
    )]
    pub pricing_data: Account<'info, PricingData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
