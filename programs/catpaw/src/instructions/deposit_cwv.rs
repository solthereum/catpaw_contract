use anchor_lang::prelude::*;

use anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, TokenAccount, Token, Transfer, Mint},
};

pub fn deposit_cwv(ctx: Context<DepositCWV>, amount: u64) -> Result<()> {
        token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.treasury_account_cwv.to_account_info(),
                        to: ctx.accounts.catpaw_account_cwv.to_account_info(),
                        authority: ctx.accounts.treasury.to_account_info(),
                    },
                ),
                amount,
        )?;

        Ok(())
}

#[derive(Accounts)]
pub struct DepositCWV<'info> {
    #[account(mut)]
    pub treasury: Signer<'info>,
    //A token PDA account of gamer, no need to init because it has PDA account already,
    #[account(
        mut,
        associated_token::mint = mint_token_cwv,
        associated_token::authority = treasury,
    )]
    pub treasury_account_cwv: Box<Account<'info, TokenAccount>>,
    
    // A token 
    pub mint_token_cwv: Box<Account<'info, Mint>>,

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