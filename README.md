## Catpaw Solana


### A simple clicker game

Gamers play game with their A token and get CWV token


### environment:

**`Ubuntu`** 

LTS 22.04,

**`anchor-cli:`** 

0.30.1,

**`solana-cli:`** 

1.18.18,

**`rustc:`** 

1.79.0,

### Install environment:

**`Rust Install guide`** 

https://www.rust-lang.org/tools/install

**`Solana Install guide`** 

https://docs.solanalabs.com/cli/install

**`Anchor Install guide`** 

https://www.anchor-lang.com/docs/installation

**`New keypair generate for test`** 
```
solana-keygen new
```
"~/.config/solana/id.json"

Copy and paste this Json file to seeds directory. 


And in seeds dir,
```
solana-keygen new --outfile gamer.json
```

And then airdrop 5 SOL from Solana faucet for every wallet.

https://faucet.solana.com/

Set as Devnet
```
solana config set --url devnet
```

### run:

```
anchor build
```

```
anchor keys sync
```

```
anchor deploy
```

```
anchor test --skip-build --skip-deploy
```
