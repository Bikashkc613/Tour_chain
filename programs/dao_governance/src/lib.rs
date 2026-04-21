use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod dao_governance {
    use super::*;

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: ProposalType,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.title = title;
        proposal.description = description;
        proposal.proposal_type = proposal_type;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.status = ProposalStatus::Active;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.bump = ctx.bumps.proposal;
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, vote_for: bool, weight: u64) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(proposal.status == ProposalStatus::Active, GovernanceError::InactiveProposal);
        
        if vote_for {
            proposal.votes_for += weight;
        } else {
            proposal.votes_against += weight;
        }
        
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalType {
    SlashOperator,
    AddVerifiedRoute,
    UpdateFeeStructure,
    TreasurySpend,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Active,
    Passed,
    Failed,
    Executed,
}

#[account]
pub struct Proposal {
    pub proposer: Pubkey,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub votes_for: u64,
    pub votes_against: u64,
    pub status: ProposalStatus,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = proposer,
        space = 8 + 32 + 100 + 500 + 1 + 8 + 8 + 1 + 8 + 1,
        seeds = [b"proposal", title.as_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub voter: Signer<'info>,
}

#[error_code]
pub enum GovernanceError {
    #[msg("The proposal is not currently active for voting.")]
    InactiveProposal,
}
