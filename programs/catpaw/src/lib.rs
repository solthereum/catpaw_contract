use anchor_lang::prelude::*;

mod instructions;
mod account_models;
// mod constant;

declare_id!("2E6gtXVfYgPQxfyNR2aBQ5CtEmsU3CCwed1N6sQ3gUEv");

#[program]
pub mod catpaw {
    use super::*;
    pub use super::instructions::*;
    
    pub fn init(ctx: Context<Initialize>) -> Result<()> {
        instructions::init(ctx)
    }

    pub fn startgame(ctx: Context<TransferA>, amount: u64) -> Result<()> {
        instructions::transfer_a(ctx, amount)
    }

    pub fn finish_game(ctx: Context<TransferCWV>, multiply: u64, amount: u64) -> Result<()> {
        instructions::transfer_cwv(ctx, multiply, amount)
    }

    pub fn change_a(ctx: Context<ChangeA>) -> Result<()> {
        instructions::change_a(ctx)
    }

    pub fn change_to(ctx: Context<ChangeTo>) -> Result<()> {
        instructions::change_to(ctx)
    }

    pub fn deposit_cwv(ctx: Context<DepositCWV>, amount: u64) -> Result<()> {
        instructions::deposit_cwv(ctx, amount)
    }

    pub fn withdraw_a(ctx: Context<WithdrawA>, amount: u64) -> Result<()> {
        instructions::withdraw_a(ctx, amount)
    }
}
