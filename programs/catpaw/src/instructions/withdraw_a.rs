use anchor_lang::prelude::*;

use anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, TokenAccount, Token, Transfer, Mint},
};

use crate::account_models::CatpawConfig;

pub fn withdraw_a(ctx: Context<WithdrawA>, amount: u64) -> Result<()> {
        token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.catpaw_account_cwv.to_account_info(),
                        to: ctx.accounts.withdraw_account_cwv.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                ),
                amount,
        )?;

        Ok(())
}

#[derive(Accounts)]
pub struct WithdrawA<'info> {
    #[account(
        mut,
        constraint = cwv_treasury.to_account_info().key() == catpawconfig.cwv_treasury.key()
    )]
    pub cwv_treasury: Signer<'info>,
    //A token PDA account of gamer, no need to init because it has PDA account already,
    #[account(
        init_if_needed,
        payer = cwv_treasury,
        associated_token::mint = mint_token_cwv,
        associated_token::authority = withdraw_account,
    )]
    pub withdraw_account_cwv: Box<Account<'info, TokenAccount>>,
    
    // A token 
    pub mint_token_cwv: Box<Account<'info, Mint>>,

    #[account(
        seeds = [b"catpawconfig"],
        bump,
    )]
    pub catpawconfig: Account<'info, CatpawConfig>,

    //Withdraw target address.
    /// CHECK: safe, 
    pub withdraw_account: AccountInfo<'info>,

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
        associated_token::mint = mint_token_cwv,
        associated_token::authority = authority,
    )]
    pub catpaw_account_cwv: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}