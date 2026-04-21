use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod booking_escrow {
    use super::*;

    pub fn create_booking(
        ctx: Context<CreateBooking>,
        amount: u64,
        service_type: ServiceType,
        start_time: i64,
        end_time: i64,
        ipfs_details_uri: String,
    ) -> Result<()> {
        let booking = &mut ctx.accounts.booking_account;
        booking.tourist = ctx.accounts.tourist.key();
        booking.operator = ctx.accounts.operator.key();
        booking.amount_usdc = amount;
        booking.service_type = service_type;
        booking.status = BookingStatus::Pending;
        booking.start_time = start_time;
        booking.end_time = end_time;
        booking.dispute_deadline = end_time + (48 * 3600); // 48h after trip ends
        booking.milestone_1_released = false;
        booking.milestone_2_released = false;
        booking.milestone_3_released = false;
        booking.ipfs_details_uri = ipfs_details_uri;
        booking.bump = ctx.bumps.booking_account;

        // In a real implementation, we would transfer USDC from tourist to PDA escrow
        // For the demo, we will simulate the lock
        
        Ok(())
    }

    pub fn confirm_booking(ctx: Context<UpdateBookingStatus>) -> Result<()> {
        let booking = &mut ctx.accounts.booking_account;
        require!(booking.status == BookingStatus::Pending, BookingError::InvalidStatus);
        booking.status = BookingStatus::Confirmed;
        Ok(())
    }

    pub fn complete_booking(ctx: Context<UpdateBookingStatus>) -> Result<()> {
        let booking = &mut ctx.accounts.booking_account;
        require!(booking.status == BookingStatus::Confirmed, BookingError::InvalidStatus);
        booking.status = BookingStatus::Completed;
        // Logic to release remaining funds to operator would go here
        Ok(())
    }

    pub fn release_milestone(ctx: Context<ReleaseMilestone>, milestone_index: u8) -> Result<()> {
        let booking = &mut ctx.accounts.booking_account;
        require!(booking.status == BookingStatus::Confirmed, BookingError::InvalidStatus);
        require!(milestone_index < 3, BookingError::InvalidMilestone);
        
        let milestone_reached = match milestone_index {
            0 => !booking.milestone_1_released,
            1 => !booking.milestone_2_released,
            2 => !booking.milestone_3_released,
            _ => false,
        };
        
        require!(milestone_reached, BookingError::MilestoneAlreadyReleased);
        
        let release_amount = match milestone_index {
            0 => booking.amount_usdc * 30 / 100,
            1 => booking.amount_usdc * 40 / 100,
            2 => booking.amount_usdc * 30 / 100,
            _ => 0,
        };
        
        // Logic to transfer release_amount from vault to operator
        
        match milestone_index {
            0 => booking.milestone_1_released = true,
            1 => booking.milestone_2_released = true,
            2 => booking.milestone_3_released = true,
            _ => (),
        }
        
        emit!(MilestoneReleasedEvent {
            booking_id: booking.key(),
            milestone_index,
            amount: release_amount,
        });
        
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ServiceType {
    DayHike,
    MultiDayTrek,
    Expedition,
    Custom,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BookingStatus {
    Pending,
    Confirmed,
    Completed,
    Disputed,
    Cancelled,
}

#[account]
pub struct BookingAccount {
    pub tourist: Pubkey,
    pub operator: Pubkey,
    pub amount_usdc: u64,
    pub service_type: ServiceType,
    pub status: BookingStatus,
    pub start_time: i64,
    pub end_time: i64,
    pub dispute_deadline: i64,
    pub milestone_1_released: bool,
    pub milestone_2_released: bool,
    pub milestone_3_released: bool,
    pub ipfs_details_uri: String,
    pub bump: u8,
}

#[event]
pub struct MilestoneReleasedEvent {
    pub booking_id: Pubkey,
    pub milestone_index: u8,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct CreateBooking<'info> {
    #[account(
        init,
        payer = tourist,
        space = 8 + 32 + 32 + 8 + 1 + 1 + 8 + 8 + 8 + 1 + 1 + 1 + (4 + 200) + 1,
        seeds = [b"booking", tourist.key().as_ref(), operator.key().as_ref(), &start_time.to_le_bytes()],
        bump
    )]
    pub booking_account: Account<'info, BookingAccount>,
    pub operator: UncheckedAccount<'info>, // In registry
    #[account(mut)]
    pub tourist: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateBookingStatus<'info> {
    #[account(mut, has_one = operator)]
    pub booking_account: Account<'info, BookingAccount>,
    pub operator: Signer<'info>,
}

#[error_code]
pub enum BookingError {
    #[msg("Invalid booking status for this action.")]
    InvalidStatus,
    #[msg("Invalid milestone index.")]
    InvalidMilestone,
    #[msg("This milestone has already been released.")]
    MilestoneAlreadyReleased,
}

#[derive(Accounts)]
pub struct ReleaseMilestone<'info> {
    #[account(mut)]
    pub booking_account: Account<'info, BookingAccount>,
    #[account(mut)]
    pub operator: Signer<'info>,
    /// CHECK: This will be the vault PDA in a real implementation
    pub vault: UncheckedAccount<'info>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
}
