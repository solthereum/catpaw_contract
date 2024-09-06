use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, TokenAccount, Token, Transfer, Mint},
};

use orao_solana_vrf::program::OraoVrf;
use orao_solana_vrf::state::NetworkState;
use orao_solana_vrf::CONFIG_ACCOUNT_SEED;
use orao_solana_vrf::RANDOMNESS_ACCOUNT_SEED;

use crate::instructions::misc::*;
use crate::account_models::*;
use crate::constant::*;

pub fn transfer_cwv(ctx: Context<TransferCWV>) -> Result<()> {
        ctx.accounts.storeamount.reload()?;
        let rand_acc = get_account_data(&ctx.accounts.random)?;
        let randomness = current_state(&rand_acc);
        if randomness == 0 {
            emit!(GameDelayEvent {
                delay: true,
            });
            return err!(StillProcessing::StillProcessing)
        } else {
            let result = (randomness % 5) + 1;
            msg!("Orao VRF result is: {}", result);
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.catpaw_account_cwv.to_account_info(),
                        to: ctx.accounts.gamer_account_cwv.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                ),
                result * ctx.accounts.storeamount.amount,
            )?;

            ctx.accounts.storeamount.reload()?;
            let storeamount = &mut ctx.accounts.storeamount;
            storeamount.flag = false;

            emit!(GameFinishEvent {
                    user: ctx.accounts.gamer.key(),
                    amount: ctx.accounts.storeamount.amount,
                    multiply: result,
            });
        }
         
        Ok(())
}

#[derive(Accounts)]
#[instruction(force: [u8; 32])]
pub struct TransferCWV<'info> {
    #[account(mut)]
    pub gamer: Signer<'info>,

    /// CHECK: Treasury
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    /// CHECK: Randomness
    #[account(
        mut,
        seeds = [RANDOMNESS_ACCOUNT_SEED.as_ref(), &force],
        bump,
        seeds::program = orao_solana_vrf::ID
    )]
    pub random: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED.as_ref()],
        bump,
        seeds::program = orao_solana_vrf::ID
    )]
    pub config: Account<'info, NetworkState>,

    pub vrf: Program<'info, OraoVrf>,

    //CWV token PDA account of gamer
    #[account(
        init_if_needed,
        payer = gamer,
        associated_token::mint = mint_token_cwv,
        associated_token::authority = gamer,
    )]
    pub gamer_account_cwv: Box<Account<'info, TokenAccount>>,

    // PDA account to store amount of A token that gamers sent to storing address
    #[account(
        mut,
        seeds = [b"storeamount", gamer.key().as_ref()],
        constraint = storeamount.flag == true,
        bump,
    )]
    pub storeamount: Account<'info, StoreAmount>,
    
    // A token 
    pub mint_token_cwv: Box<Account<'info, Mint>>,

    /// CHECK: safe
    #[account(
        mut,
        seeds = [b"authority"],
        bump
    )]
    pub authority: AccountInfo<'info>,

    // PDA account of authority for CWV token
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