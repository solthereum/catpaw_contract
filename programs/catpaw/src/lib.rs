use anchor_lang::prelude::*;

mod instructions;
mod account_models;
mod constant;

declare_id!("73RsoiwAh7gebpPnfTjxh7LMtShYGsy4EioPzaJK4En9");

#[program]
pub mod catpaw {
    use super::*;
    pub use super::instructions::*;
    
    pub fn init(ctx: Context<Initialize>) -> Result<()> {
        instructions::init(ctx)
    }

    pub fn startgame(ctx: Context<TransferA>, amount: u64, force: [u8; 32]) -> Result<()> {
        instructions::transfer_a(ctx, amount, force)
    }

    pub fn finish_game(ctx: Context<TransferCWV>) -> Result<()> {
        instructions::transfer_cwv(ctx)
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

    pub fn create_token_mint(
        ctx: Context<CreateTokenMint>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        instructions::create_token_mint(ctx, token_name, token_symbol, token_uri)
    }
}
