use anchor_lang::prelude::*;

#[error_code]
pub enum StillProcessing {
    #[msg("Randomness is still being fulfilled")]
    StillProcessing
}

#[constant]
pub const TOTAL_SUPPLY: u64 = 1000000000 * 10u64.pow(TOKEN_DECIMAL as u32);
pub const TOKEN_DECIMAL: u8 = 9;