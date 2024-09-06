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

#[account]
#[derive(Default)]
pub struct StoreAmount {
    pub amount: u64,
    pub force: [u8; 32],
    pub flag: bool,
}

impl StoreAmount {
    pub const LEN: usize = 8 + 8 + 32 + 1;
}

#[event]
pub struct GameFinishEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub multiply: u64,
}

#[event]
pub struct GameDelayEvent {
    pub delay: bool,
}
