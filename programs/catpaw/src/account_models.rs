use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct CatpawConfig {
    //The owner of smart contract
    pub cwv_treasury: Pubkey,
    //A token users have to buy from Pump.fun, game fee token.
    pub mint_token_a: Pubkey,
    //A token destination account(default is smart contract authority)
    pub store_token_a: Pubkey,
}

impl CatpawConfig {
    pub const LEN: usize = 8 + 32 + 32 + 32;
}

#[event]
pub struct GameFinishEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub multiply: u64,
}

#[event]
pub struct GameStartEvent {
    pub user: Pubkey,
    pub amount: u64,
}
