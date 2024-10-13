
use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{TokenAccount, Token, Mint},
};

use crate::account_models::CatpawConfig;

pub fn change_to(ctx: Context<ChangeTo>) -> Result<()> {
        ctx.accounts.catpawconfig.reload()?;
        let owner = ctx.accounts.catpawconfig.cwv_treasury;

        assert_eq!(owner, ctx.accounts.cwv_treasury.key());//Can be called by only cwv_treasury.
        
        let catpawconfig = &mut ctx.accounts.catpawconfig;
        catpawconfig.store_token_a = ctx.accounts.new_to_account.key();
        
        Ok(())
}

#[derive(Accounts)]
pub struct ChangeTo<'info> {
    //Can be called by only cwv_treasury.
    #[account(
        mut,
        constraint = cwv_treasury.to_account_info().key() == catpawconfig.cwv_treasury.key()
    )]
    pub cwv_treasury: Signer<'info>,

    #[account(
        mut,
        seeds = [b"catpawconfig"],
        bump,
    )]
    pub catpawconfig: Account<'info, CatpawConfig>,

    /// CHECK: safe, 
    //New destination address
    #[account(mut)]
    pub new_to_account: AccountInfo<'info>,

    // A token gamer have to buy from Pump.fun to play game.
    pub mint_token_a: Box<Account<'info, Mint>>,

    // PDA account of new_to_account for A token.
    #[account(
        init_if_needed,
        payer = cwv_treasury,
        associated_token::mint = mint_token_a,
        associated_token::authority = new_to_account,
    )]
    pub catpaw_account_a: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}