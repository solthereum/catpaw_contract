import * as anchor from "@coral-xyz/anchor";
import { Program , web3} from "@coral-xyz/anchor";
import { Catpaw } from "../target/types/catpaw";
import { BN } from "bn.js";
import { expect } from "chai";
import { TestValues, createValues, expectRevert, mintingTokens, sleep } from "./utils";

describe("catpaw", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.Catpaw as Program<Catpaw>;

  let values: TestValues;

  beforeEach(() => {
    values = createValues();
  });

  it("Is initialized!", async () => {

      // A token create and 1000 mint to Gamer. Mint authority is Gamer.
      await mintingTokens({
        connection: connection,
        creator:  values.gamer,
        mintAKeypair: values.mintAKeypair,
      });

      // CWV token create and 1000 mint to cwv_treasury. Mint authority is cwv_treasury.
      await mintingTokens({
        connection: connection,
        creator:  values.cwv_treasury,
        mintAKeypair: values.mintCWVKeypair,
      });

      const tx_init = await program.methods
        .init()
        .accounts({
          mintTokenA: values.mintAKeypair.publicKey, 
          mintTokenCwv: values.mintCWVKeypair.publicKey,
          storeAccount: values.authority,
        })
        .rpc({skipPreflight: false});

      console.log("Init transaction: ", tx_init);

      const accountData = await program.account.catpawConfig.fetch(values.catpawconfigPDA);
      expect(accountData.cwvTreasury.toString()).to.equal(values.cwv_treasury.publicKey.toString());
      expect(accountData.storeTokenA.toString()).to.equal(values.authority.toString());
      expect(accountData.mintTokenA.toString()).to.equal(values.mintAKeypair.publicKey.toString());

      console.log("CWV_treasury(contract owner) address: ", accountData.cwvTreasury.toString());
      console.log("A(Pump.fun) token address: ", accountData.mintTokenA.toString());

      const cwvTreasuryLamports = await connection.getBalance(
        accountData.cwvTreasury
      );

      console.log("CWV_treasury SOL amount: ", cwvTreasuryLamports);

  });

  it("Game start!", async () => {

    // A token create and 1000 mint to Gamer. Mint authority is Gamer.
    await mintingTokens({
      connection: connection,
      creator:  values.gamer,
      mintAKeypair: values.mintAKeypair,
    });

    // CWV token create and 1000 mint to cwv_treasury. Mint authority is cwv_treasury.
    await mintingTokens({
      connection: connection,
      creator:  values.cwv_treasury,
      mintAKeypair: values.mintCWVKeypair,
    });

    const tx_init = await program.methods
      .init()
      .accounts({
        mintTokenA: values.mintAKeypair.publicKey, 
        mintTokenCwv: values.mintCWVKeypair.publicKey,
        storeAccount: values.authority,
      })
      .rpc({skipPreflight: false});

    console.log("Init transaction: ", tx_init);
      
    const gamerTokenAAmount1 = await connection
      .getTokenAccountBalance(values.gamerAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of Gamer before start game", gamerTokenAAmount1);

    const catpawTokenAAmount1 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of contract before start game", catpawTokenAAmount1);

    // Start game(send 100 A token to contract)
    const tx_gamestart = await program.methods
        .startgame(new BN(100).mul(new BN(10 ** 9)))
        .accounts({
          gamer: values.gamer.publicKey,
        })
        .signers([values.gamer])
        .rpc({ skipPreflight: false });

    console.log("Game start transaction: ", tx_gamestart);
    
    const gamerTokenAAmount2 = await connection
      .getTokenAccountBalance(values.gamerAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of Gamer after start game", gamerTokenAAmount2);

    const catpawTokenAAmount2 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of contract after start game", catpawTokenAAmount2);

    expect(Number(gamerTokenAAmount2)).to.equal(Number(gamerTokenAAmount1) - Number(new BN(100).mul(new BN(10 ** 9))));
    expect(Number(catpawTokenAAmount2)).to.equal(Number(catpawTokenAAmount1) + Number(new BN(100).mul(new BN(10 ** 9))));
  });

  it("Game finish!", async () => {

    // A token create and 1000 mint to Gamer. Mint authority is Gamer.
    await mintingTokens({
      connection: connection,
      creator:  values.gamer,
      mintAKeypair: values.mintAKeypair,
    });

    // CWV token create and 1000 mint to cwv_treasury. Mint authority is cwv_treasury.
    await mintingTokens({
      connection: connection,
      creator:  values.cwv_treasury,
      mintAKeypair: values.mintCWVKeypair,
    });

    const tx_init = await program.methods
      .init()
      .accounts({
        mintTokenA: values.mintAKeypair.publicKey, 
        mintTokenCwv: values.mintCWVKeypair.publicKey,
        storeAccount: values.authority,
      })
      .rpc({skipPreflight: false});

    console.log("Init transaction: ", tx_init);
      
    
    const cwvTreasuryTokenCWVAmount1 = await connection
      .getTokenAccountBalance(values.cwvtreasureAccountCWV)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("CWV token amount of cwv_treasure before deposit CWV token to contract", cwvTreasuryTokenCWVAmount1);

    const catpawTokenCWVmount1 = await connection
      .getTokenAccountBalance(values.catpawAccountCWV)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("CWV token amount of contract before cwv_treasury deposit CWV token to contract", catpawTokenCWVmount1);

    //cwv_treasury wallet deposit 500 CWV token to contract
    await program.methods
      .depositCwv(new BN(500).mul(new BN(10 ** 9)))
      .accounts({
        mintTokenCwv: values.mintCWVKeypair.publicKey,
      })
      .signers([values.cwv_treasury])
      .rpc({skipPreflight: false});

    const cwvTreasuryTokenCWVAmount2 = await connection
      .getTokenAccountBalance(values.cwvtreasureAccountCWV)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("CWV token amount of cwv_treasure after deposit CWV token to contract", cwvTreasuryTokenCWVAmount2);

    const catpawTokenCWVmount2 = await connection
      .getTokenAccountBalance(values.catpawAccountCWV)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("CWV token amount of contract after cwv_treasury deposit CWV token to contract", catpawTokenCWVmount2);

    expect(Number(cwvTreasuryTokenCWVAmount2)).to.equal(Number(cwvTreasuryTokenCWVAmount1) - Number(new BN(500).mul(new BN(10 ** 9))));
    expect(Number(catpawTokenCWVmount2)).to.equal(Number(catpawTokenCWVmount1) + Number(new BN(500).mul(new BN(10 ** 9))));

    const gamerTokenAAmount1 = await connection
      .getTokenAccountBalance(values.gamerAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of Gamer before start game", gamerTokenAAmount1);

    const catpawTokenAAmount1 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of contract before start game", catpawTokenAAmount1);

    // Start game(send 100 A token to contract)
    const tx = await program.methods
        .startgame(new BN(100).mul(new BN(10 ** 9)))
        .accounts({
          gamer: values.gamer.publicKey,
        })
        .signers([values.gamer])
        .rpc({ skipPreflight: false });

    console.log("game start transaction: ", tx);
    
    const gamerTokenAAmount2 = await connection
      .getTokenAccountBalance(values.gamerAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of Gamer after start game", gamerTokenAAmount2);

    const catpawTokenAAmount2 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of contract after start game", catpawTokenAAmount2);

    // finish gamer of a user with random number(e.g. 3), this funtion is invoked only cwv_treasury wallet
    await program.methods
      .finishGame(new BN(3), new BN(100).mul(new BN(10 ** 9)))
      .accounts({
        mintTokenCwv: values.mintCWVKeypair.publicKey,
        gamer: values.gamer.publicKey,
      })
      .rpc({ skipPreflight: false });

    const catpawTokenCWVmount3 = await connection
      .getTokenAccountBalance(values.catpawAccountCWV)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("CWV token amount of contract after finish game", catpawTokenCWVmount3);

    const gamerTokenCWVmount2 = await connection
      .getTokenAccountBalance(values.gamerAccountCWV)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("CWV token amount of Gamer after finish game", gamerTokenCWVmount2);

    expect(Number(gamerTokenCWVmount2)).to.equal(Number(new BN(100).mul(new BN(10 ** 9)).mul(new BN(3))));
  });

  it("Change A(Pump.fun) token address, can be invoked with only cwv_treasury address", async () => {

    // A token create and 1000 mint to Gamer. Mint authority is Gamer.
    await mintingTokens({
      connection: connection,
      creator:  values.gamer,
      mintAKeypair: values.mintAKeypair,
    });

    // new A token create and 1000 mint to Gamer. Mint authority is Gamer.
    await mintingTokens({
      connection: connection,
      creator:  values.gamer,
      mintAKeypair: values.newMintAKeypair,
    });

    // CWV token create and 1000 mint to cwv_treasury. Mint authority is cwv_treasury.
    await mintingTokens({
      connection: connection,
      creator:  values.cwv_treasury,
      mintAKeypair: values.mintCWVKeypair,
    });

    const tx_init = await program.methods
      .init()
      .accounts({
        mintTokenA: values.mintAKeypair.publicKey, 
        mintTokenCwv: values.mintCWVKeypair.publicKey,
        storeAccount: values.authority,
      })
      .rpc({skipPreflight: false});

    console.log("Init transaction: ", tx_init);
    
    const accountData1 = await program.account.catpawConfig.fetch(values.catpawconfigPDA);

    // change A token address by cwv_treasury
    await program.methods
      .changeA()
      .accounts({
        newMintTokenA: values.newMintAKeypair.publicKey,
        storeAccount: accountData1.storeTokenA
      })
      .rpc({ skipPreflight: false });

    const accountData2 = await program.account.catpawConfig.fetch(values.catpawconfigPDA);
    expect(accountData2.mintTokenA.toString()).to.equal(values.newMintAKeypair.publicKey.toString());
  });

  it("Confirm assert error if other address invoke change_a funtion", async () => {

    // A token create and 1000 mint to Gamer. Mint authority is Gamer.
    await mintingTokens({
      connection: connection,
      creator:  values.gamer,
      mintAKeypair: values.mintAKeypair,
    });

    // new A token create and 1000 mint to Gamer. Mint authority is Gamer.
    await mintingTokens({
      connection: connection,
      creator:  values.gamer,
      mintAKeypair: values.newMintAKeypair,
    });

    // CWV token create and 1000 mint to cwv_treasury. Mint authority is cwv_treasury.
    await mintingTokens({
      connection: connection,
      creator:  values.cwv_treasury,
      mintAKeypair: values.mintCWVKeypair,
    });

    const tx_init = await program.methods
      .init()
      .accounts({
        mintTokenA: values.mintAKeypair.publicKey, 
        mintTokenCwv: values.mintCWVKeypair.publicKey,
        storeAccount: values.authority,
      })
      .rpc({skipPreflight: false});

    console.log("Init transaction: ", tx_init);
    
    const accountData = await program.account.catpawConfig.fetch(values.catpawconfigPDA);

    // assert if other try to change A token address.
    await expectRevert(program.methods
      .changeA()
      .accounts({
        newMintTokenA: values.newMintAKeypair.publicKey,
        storeAccount: accountData.storeTokenA
      })
      .signers([values.gamer])
      .rpc({ skipPreflight: false }));
  });

  it("Change Storing address", async () => {

    // CWV token create and 1000 mint to cwv_treasury. Mint authority is cwv_treasury.
    await mintingTokens({
      connection: connection,
      creator: values.cwv_treasury,
      mintAKeypair: values.mintCWVKeypair,
    })

    // A token create and 1000 mint to Gamer. Mint authority is Gamer.
    await mintingTokens({
      connection: connection,
      creator: values.gamer,
      mintAKeypair: values.mintAKeypair,
    })

    await program.methods
      .init()
      .accounts({
        mintTokenA: values.mintAKeypair.publicKey, 
        mintTokenCwv: values.mintCWVKeypair.publicKey,
        storeAccount: values.authority,
      })
      .rpc({ skipPreflight: false })

    // change destination address gamers send their A token by cwv_treasury
    const tx_changeTo = await program.methods
      .changeTo()
      .accounts({
        newToAccount: values.newStoringKeypair.publicKey,
        mintTokenA: values.mintAKeypair.publicKey,
      })
      .rpc({ skipPreflight: false });
    
    console.log("changeto transaction", tx_changeTo);    

    const accountData = await program.account.catpawConfig.fetch(values.catpawconfigPDA);
    expect(accountData.storeTokenA.toString()).to.equal(values.newStoringKeypair.publicKey.toString());
  });

  it("Withdraw", async () => {

    // A token create and 1000 mint to Gamer. Mint authority is Gamer.
    await mintingTokens({
      connection: connection,
      creator:  values.gamer,
      mintAKeypair: values.mintAKeypair,
    });  

    // CWV token create and 1000 mint to cwv_treasury. Mint authority is cwv_treasury.
    await mintingTokens({
      connection: connection,
      creator:  values.cwv_treasury,
      mintAKeypair: values.mintCWVKeypair,
    });

    const tx_init = await program.methods
      .init()
      .accounts({
        mintTokenA: values.mintAKeypair.publicKey, 
        mintTokenCwv: values.mintCWVKeypair.publicKey,
        storeAccount: values.authority,
      })
      .rpc({skipPreflight: false});

    console.log("Init transaction: ", tx_init);
      
    const gamerTokenAAmount1 = await connection
      .getTokenAccountBalance(values.gamerAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of Gamer before start game", gamerTokenAAmount1);

    const catpawTokenAAmount1 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of contract before start game", catpawTokenAAmount1);

    // Start game(send 100 A token to contract)
    const tx_gamestart = await program.methods
      .startgame(new BN(100).mul(new BN(10 ** 9)))
      .accounts({
        gamer: values.gamer.publicKey,
      })
      .signers([values.gamer])
      .rpc({ skipPreflight: false });

    console.log("Game start transaction: ", tx_gamestart);
    
    const gamerTokenAAmount2 = await connection
      .getTokenAccountBalance(values.gamerAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of Gamer after start game", gamerTokenAAmount2);

    const catpawTokenAAmount2 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of contract after start game", catpawTokenAAmount2);

    // withdraw 100 A token to withdraw account by cwv_treasury
    const tx_withdraw = await program.methods
      .withdrawA(new BN(100).mul(new BN(10 ** 9)))
      .accounts({
        withdrawAccount: values.withdrawKeypair.publicKey,
        mintTokenA: values.mintAKeypair.publicKey,
      })
      .rpc({ skipPreflight: false });
    
    console.log("withdraw transaction", tx_withdraw);

    const catpawTokenAAmount3 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("A token amount of contract after withdraw", catpawTokenAAmount3);

    const withdrawTokenAAmount = await connection
      .getTokenAccountBalance(values.withdrawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });
    
    console.log("A token amount of withdraw account after withdraw", withdrawTokenAAmount);

    expect(Number(withdrawTokenAAmount)).to.equal(Number(new BN(100).mul(new BN(10 ** 9))));
  });
});
