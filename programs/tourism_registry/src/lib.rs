use anchor_lang::prelude::*;

declare_id!("2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy");

#[program]
pub mod tourism_registry {
    use super::*;

    pub fn register_operator(
        ctx: Context<RegisterOperator>,
        name: String,
        category: OperatorCategory,
        metadata_uri: String,
        stake_amount: u64,
    ) -> Result<()> {
        let operator = &mut ctx.accounts.operator_account;
        operator.authority = ctx.accounts.authority.key();
        operator.name = name;
        operator.category = category;
        operator.metadata_uri = metadata_uri;
        operator.reputation_score = 100; // Starting score
        operator.total_ratings_count = 0;
        operator.total_bookings = 0;
        operator.stake_lamports = stake_amount;
        operator.is_verified = false;
        operator.created_at = Clock::get()?.unix_timestamp;
        operator.bump = ctx.bumps.operator_account;

        // Perform the stake transfer (SOL)
        let cpi_context = Context::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.operator_account.to_account_info(),
            },
        );
        // Note: In a real implementation, we might want to transfer to a separate vault PDA
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.operator_account.to_account_info(),
                },
            ),
            stake_amount,
        )?;

        Ok(())
    }

    pub fn update_operator(
        ctx: Context<UpdateOperator>,
        name: Option<String>,
        metadata_uri: Option<String>,
    ) -> Result<()> {
        let operator = &mut ctx.accounts.operator_account;
        if let Some(n) = name { operator.name = n; }
        if let Some(m) = metadata_uri { operator.metadata_uri = m; }
        Ok(())
    }

    pub fn submit_review(
        ctx: Context<SubmitReview>,
        rating: u8, // 1-5
        comment: String,
    ) -> Result<()> {
        require!(rating >= 1 && rating <= 5, TourismError::InvalidRating);
        
        let operator = &mut ctx.accounts.operator_account;
        let review = &mut ctx.accounts.review_account;
        
        review.tourist = ctx.accounts.tourist.key();
        review.operator = operator.key();
        review.rating = rating;
        review.comment = comment;
        review.timestamp = Clock::get()?.unix_timestamp;
        
        // Update operator score (simple moving average logic)
        // new_score = (old_score * total + rating * 100) / (total + 1)
        let total_ratings = operator.total_ratings_count;
        let current_score = operator.reputation_score;
        
        operator.reputation_score = (current_score * total_ratings + (rating as u64 * 20)) / (total_ratings + 1);
        operator.total_ratings_count += 1;
        operator.total_bookings += 1;
        
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OperatorCategory {
    Guide,
    Teahouse,
    Agency,
    Transport,
    Accommodation,
}

#[account]
pub struct OperatorAccount {
    pub authority: Pubkey,
    pub name: String,
    pub category: OperatorCategory,
    pub metadata_uri: String,
    pub reputation_score: u64, // Normalized 1-100
    pub total_ratings_count: u64,
    pub total_bookings: u64,
    pub stake_lamports: u64,
    pub is_verified: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct ReviewAccount {
    pub tourist: Pubkey,
    pub operator: Pubkey,
    pub rating: u8,
    pub comment: String,
    pub timestamp: i64,
}

#[derive(Accounts)]
pub struct RegisterOperator<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + (4 + 100) + 1 + (4 + 200) + 8 + 8 + 8 + 8 + 1 + 8 + 1,
        seeds = [b"operator", authority.key().as_ref()],
        bump
    )]
    pub operator_account: Account<'info, OperatorAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateOperator<'info> {
    #[account(
        mut,
        seeds = [b"operator", authority.key().as_ref()],
        bump = operator_account.bump,
        has_one = authority
    )]
    pub operator_account: Account<'info, OperatorAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(rating: u8, comment: String)]
pub struct SubmitReview<'info> {
    #[account(
        init,
        payer = tourist,
        space = 8 + 32 + 32 + 1 + (4 + 200) + 8,
        seeds = [b"review", operator_account.key().as_ref(), tourist.key().as_ref()],
        bump
    )]
    pub review_account: Account<'info, ReviewAccount>,
    #[account(mut)]
    pub operator_account: Account<'info, OperatorAccount>,
    #[account(mut)]
    pub tourist: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum TourismError {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
}

