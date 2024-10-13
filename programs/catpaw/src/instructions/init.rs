
use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{TokenAccount, Token, Mint},
};

use crate::account_models::CatpawConfig;

pub fn init(ctx: Context<Initialize>) -> Result<()> {
    //Store treasury wallet of smart contract, A token address, A token storing address from Init parameter.
    let catpawconfig = &mut ctx.accounts.catpawconfig;
    catpawconfig.cwv_treasury = ctx.accounts.cwv_treasury.key();
    catpawconfig.mint_token_a = ctx.accounts.mint_token_a.key();
    catpawconfig.store_token_a = ctx.accounts.store_account.key();
    msg!("Catpaw config created!");
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    //owner of smart contract
    #[account(mut)]
    pub cwv_treasury: Signer<'info>,
    
    /// CHECK: safe, 
    /// Smart contract authority to be used for sending CWV token to gamer
    #[account(
        mut,
        seeds = [b"authority"],
        bump
    )]
    pub authority: AccountInfo<'info>,

    // Store treasury wallet of smart contract, A token address, A token storing address(contract itself or other specified address)
    #[account(
        init_if_needed,
        payer = cwv_treasury,
        space = CatpawConfig::LEN,
        seeds = [b"catpawconfig"],
        bump,
    )]
    pub catpawconfig: Account<'info, CatpawConfig>,

    // A token that gamer have to buy from Pump.fun to play game.
    #[account(mut)]
    pub mint_token_a: Box<Account<'info, Mint>>,

    ///CHECK: safe 
    //A token storing address(contract itself or other specified address)
    #[account(mut)]
    pub store_account: AccountInfo<'info>,

    //A token PDA account of storing address.
    #[account(
        init_if_needed,
        payer = cwv_treasury,
        associated_token::mint = mint_token_a,
        associated_token::authority = store_account,
    )]
    pub catpaw_account_a: Box<Account<'info, TokenAccount>>,
    
    // CWV token
    pub mint_token_cwv: Box<Account<'info, Mint>>,

    //CWV token PDA account of authority
    #[account(
        init_if_needed,
        payer = cwv_treasury,
        associated_token::mint = mint_token_cwv,
        associated_token::authority = authority,
    )]
    pub catpaw_account_cwv: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}