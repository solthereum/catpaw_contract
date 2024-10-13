use anchor_lang::prelude::*;

use anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, TokenAccount, Token, Transfer},
};

use crate::account_models::*;

pub fn transfer_a(ctx: Context<TransferA>, amount: u64) -> Result<()> {
    //Transfer amount of A token from gamer to store account.
    token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.gamer_account_a.to_account_info(),
                    to: ctx.accounts.catpaw_account_a.to_account_info(),
                    authority: ctx.accounts.gamer.to_account_info(),
                },
            ),
            amount,
    )?;
    msg!("Started game!");
    //Emit start event.
    emit!(GameStartEvent {
        user: ctx.accounts.gamer.key(),
        amount: amount,
    });
    Ok(())
}

#[derive(Accounts)]
pub struct TransferA<'info> {

    #[account(mut)]
    pub gamer: Signer<'info>,

    //A token PDA account of gamer, no need to init because gamer has PDA account already,
    #[account(
        mut,
        associated_token::mint = catpawconfig.mint_token_a,
        associated_token::authority = gamer,
    )]
    pub gamer_account_a: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [b"catpawconfig"],
        bump,
    )]
    pub catpawconfig: Account<'info, CatpawConfig>,
    
    //A token PDA account of A storing address.
    #[account(
        mut,
        associated_token::mint = catpawconfig.mint_token_a,
        associated_token::authority = catpawconfig.store_token_a,
    )]
    pub catpaw_account_a: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}