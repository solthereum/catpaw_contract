
use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{TokenAccount, Token, Mint},
};

use crate::account_models::CatpawConfig;

pub fn change_to(ctx: Context<ChangeTo>) -> Result<()> {
        ctx.accounts.catpawconfig.reload()?;
        let owner = ctx.accounts.catpawconfig.cwv_treasury;

        assert_eq!(owner, ctx.accounts.cwv_treasury.key());
        
        let catpawconfig = &mut ctx.accounts.catpawconfig;
        catpawconfig.store_token_a = ctx.accounts.new_to_account.key();
        
        Ok(())
}

#[derive(Accounts)]
pub struct ChangeTo<'info> {
    #[account(
        mut,
        constraint = cwv_treasury.to_account_info().key() == catpawconfig.cwv_treasury.key()
    )]
    pub cwv_treasury: Signer<'info>,

    #[account(
        seeds = [b"catpawconfig"],
        bump,
    )]
    pub catpawconfig: Account<'info, CatpawConfig>,

    //New A token gamer have to buy from Pump.fun to play game.
    /// CHECK: safe, 
    pub new_to_account: AccountInfo<'info>,

    // A token gamer have to buy from Pump.fun to play game.
    pub mint_token_a: Box<Account<'info, Mint>>,

    // PDA account of authority for A token.
    #[account(
        init_if_needed,
        payer = cwv_treasury,
        associated_token::mint = mint_token_a,
        associated_token::authority = new_to_account,
    )]
    pub catpaw_account_cwv: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}