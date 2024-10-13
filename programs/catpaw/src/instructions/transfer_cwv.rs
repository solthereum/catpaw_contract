use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, TokenAccount, Token, Transfer, Mint},
};

use crate::account_models::*;
pub const AUTHORITY_SEED: &str = "authority";

pub fn transfer_cwv(ctx: Context<TransferCWV>, multiply: u64, amount: u64) -> Result<()> {
    
    ctx.accounts.catpawconfig.reload()?;
    let owner = ctx.accounts.catpawconfig.cwv_treasury;
    assert_eq!(owner, ctx.accounts.cwv_treasury.key());//Can be called by only cwv_treasury.

    let authority_bump = ctx.bumps.authority;
    let authority_seeds = &[
        AUTHORITY_SEED.as_bytes(),
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];

    //Sent <multiply * amount> amount of CWV token to gamer.
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.catpaw_account_cwv.to_account_info(),
                to: ctx.accounts.gamer_account_cwv.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
            signer_seeds
        ),
        multiply * amount,
    )?;
    emit!(GameFinishEvent {
        user: ctx.accounts.gamer.key(),
        amount: amount,
        multiply: multiply,
    });
    Ok(())
}

#[derive(Accounts)]
pub struct TransferCWV<'info> {
    //Can be called by only cwv_treasury.
    #[account(
        mut,
        constraint = cwv_treasury.to_account_info().key() == catpawconfig.cwv_treasury.key()
    )]
    pub cwv_treasury: Signer<'info>,

    //CWV token PDA account of gamer
    #[account(
        init_if_needed,
        payer = cwv_treasury,
        associated_token::mint = mint_token_cwv,
        associated_token::authority = gamer,
    )]
    pub gamer_account_cwv: Box<Account<'info, TokenAccount>>,
    
    // CWV token 
    pub mint_token_cwv: Box<Account<'info, Mint>>,

    /// CHECK: safe
    #[account(
        mut,
        seeds = [b"authority"],
        bump
    )]
    pub authority: AccountInfo<'info>,

    ///CHECK: safe
    #[account(mut)]
    pub gamer: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"catpawconfig"],
        bump,
    )]
    pub catpawconfig: Account<'info, CatpawConfig>,

    // PDA account of authority for CWV token
    #[account(
        mut,
        associated_token::mint = mint_token_cwv,
        associated_token::authority = catpawconfig.store_token_a,
    )]
    pub catpaw_account_cwv: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}