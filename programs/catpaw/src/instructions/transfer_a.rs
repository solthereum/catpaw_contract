use anchor_lang::prelude::*;

use anchor_spl::{
        associated_token::AssociatedToken,
        token::{self, TokenAccount, Token, Transfer},
};

use orao_solana_vrf::program::OraoVrf;
use orao_solana_vrf::state::NetworkState;
use orao_solana_vrf::CONFIG_ACCOUNT_SEED;
use orao_solana_vrf::RANDOMNESS_ACCOUNT_SEED;
use orao_solana_vrf::cpi::accounts::RequestV2;

use crate::account_models::*;

pub fn transfer_a(ctx: Context<TransferA>, amount: u64, force: [u8; 32]) -> Result<()> {
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
        // // store A token amoutn of gamer if transfer transaction is successed.
        ctx.accounts.storeamount.reload()?;
        let storeamount = &mut ctx.accounts.storeamount;
        storeamount.amount = amount;

        // // Request randomness.
        // let cpi_program = ctx.accounts.vrf.to_account_info();
        // let cpi_accounts = RequestV2 {
        //     payer: ctx.accounts.gamer.to_account_info(),
        //     network_state: ctx.accounts.config.to_account_info(),
        //     treasury: ctx.accounts.treasury.to_account_info(),
        //     request: ctx.accounts.random.to_account_info(),
        //     system_program: ctx.accounts.system_program.to_account_info(),
        // };
        // let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        // orao_solana_vrf::cpi::request_v2(cpi_ctx, force)?;

        // storeamount.flag = true;//Processing...
        // storeamount.force = force;
        msg!("Started game!");
        Ok(())
}

#[derive(Accounts)]
#[instruction(force: [u8; 32])]
pub struct TransferA<'info> {

    #[account(mut)]
    pub gamer: Signer<'info>,

    /// CHECK:
    #[account(
        mut,
        seeds = [
            RANDOMNESS_ACCOUNT_SEED, 
            // &force
            b"random"
            ],
        bump,
        seeds::program = orao_solana_vrf::ID
    )]
    pub random: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        bump,
        seeds::program = orao_solana_vrf::ID
    )]
    pub config: Account<'info, NetworkState>,

    pub vrf: Program<'info, OraoVrf>,

    //A token PDA account of gamer, no need to init because it has PDA account already,
    #[account(
        mut,
        associated_token::mint = catpawconfig.mint_token_a,
        associated_token::authority = gamer,
    )]
    pub gamer_account_a: Box<Account<'info, TokenAccount>>,

    // PDA account to store amount of A token that gamers sent to storing address
    #[account(
        init_if_needed,
        payer = gamer,
        space = StoreAmount::LEN,
        seeds = [b"storeamount", gamer.key().as_ref()],
        bump,
    )]
    pub storeamount: Account<'info, StoreAmount>,
    
    // // A token 
    // pub mint_token_a: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [b"catpawconfig"],
        bump,
    )]
    pub catpawconfig: Account<'info, CatpawConfig>,

    ///CHECK: safe
    // #[account(mut)]
    // pub store_account: AccountInfo<'info>,
    
    //A token PDA account of authority.
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