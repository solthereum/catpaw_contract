use anchor_lang::prelude::*;

use anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, TokenAccount, Token, Transfer, Mint},
};

use crate::account_models::CatpawConfig;
pub const AUTHORITY_SEED: &str = "authority";

pub fn withdraw_a(ctx: Context<WithdrawA>, amount: u64) -> Result<()> {

    ctx.accounts.catpawconfig.reload()?;
    let owner = ctx.accounts.catpawconfig.cwv_treasury;
    assert_eq!(owner, ctx.accounts.cwv_treasury.key());//Can be called by only cwv_treasury.

    let authority_bump = ctx.bumps.authority;
    let authority_seeds = &[
        AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    //Sent A token from contract to withdraw_account.
    token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.catpaw_account_a.to_account_info(),
                    to: ctx.accounts.withdraw_account_a.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawA<'info> {
    //Can be called by only cwv_treasury.
    #[account(
        mut,
        constraint = cwv_treasury.to_account_info().key() == catpawconfig.cwv_treasury.key()
    )]
    pub cwv_treasury: Signer<'info>,
    
    /// CHECK: safe, 
    //Withdraw target address.
    #[account(mut)]
    pub withdraw_account: AccountInfo<'info>,

    //A token PDA account of withdraw_account
    #[account(
        init_if_needed,
        payer = cwv_treasury,
        associated_token::mint = mint_token_a,
        associated_token::authority = withdraw_account,
    )]
    pub withdraw_account_a: Box<Account<'info, TokenAccount>>,
    
    // A token 
    pub mint_token_a: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [b"catpawconfig"],
        bump,
    )]
    pub catpawconfig: Account<'info, CatpawConfig>,

    /// CHECK: safe, 
    /// smart contract authority to be used for sending CWV token to gamer
    #[account(
        mut,
        seeds = [b"authority"],
        bump
    )]
    pub authority: AccountInfo<'info>,
    
    //A token PDA account of authority.
    #[account(
        mut,
        associated_token::mint = mint_token_a,
        associated_token::authority = authority,
    )]
    pub catpaw_account_a: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}