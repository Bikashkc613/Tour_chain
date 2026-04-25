use anchor_lang::prelude::*;

declare_id!("EvRzd8MXqxojEmn4jViXv8NyxVXoU3X1gEuSv1tw9qML");

#[program]
pub mod tourchain_proof {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
