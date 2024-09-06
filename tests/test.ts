import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Catpaw } from "../target/types/catpaw";
import { BN } from "bn.js";
import { networkStateAccountAddress } from "@orao-network/solana-vrf";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
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

  // it("Is initialized!", async () => {

  //     await mintingTokens({
  //       connection: connection,
  //       creator:  values.gamer,
  //       mintAKeypair: values.mintAKeypair,
  //       program,
  //     });

  //     await mintingTokens({
  //       connection: connection,
  //       creator:  values.cwv_treasury,
  //       mintAKeypair: values.mintCWVKeypair,
  //       program,
  //     });

  //     await expectRevert(program.methods
  //       .init()
  //       .accounts({
  //         mintTokenA: values.mintAKeypair.publicKey, 
  //         mintTokenCwv: values.mintCWVKeypair.publicKey,
  //         storeAccount: values.authority,
  //         authority: values.authority,
  //         catpawconfig: values.catpawconfigPDA,
  //         catpawAccountA: values.catpawAccountA,
  //         catpawAccountCwv: values.catpawAccountCWV,
  //       })
  //       .rpc({skipPreflight: true})
  //     );

  //     const accountData = await program.account.catpawConfig.fetch(values.catpawconfigPDA);
  //     expect(accountData.cwvTreasury.toString()).to.equal(values.cwv_treasury.publicKey.toString());
  //     expect(accountData.storeTokenA.toString()).to.equal(values.authority.toString());
  //     expect(accountData.mintTokenA.toString()).to.equal(values.mintAKeypair.publicKey.toString());

  //     console.log("CWV_treasury address: ", accountData.cwvTreasury.toString());
  //     console.log("A token address: ", accountData.mintTokenA.toString());

  //     const cwvTreasuryLamports = await connection.getBalance(
  //       accountData.cwvTreasury
  //     );

  //     console.log("CWV_treasury SOL amount: ", cwvTreasuryLamports);

  // });

  it("Game start!", async () => {

    await mintingTokens({
      connection: connection,
      creator: values.gamer,
      mintAKeypair: values.mintAKeypair,
      program,
    });

    await mintingTokens({
      connection: connection,
      creator: values.cwv_treasury,
      mintAKeypair: values.mintCWVKeypair,
      program,
    });

    await program.methods
      .init()
      .accounts({
        mintTokenA: values.mintAKeypair.publicKey,
        mintTokenCwv: values.mintCWVKeypair.publicKey,
        storeAccount: values.authority,
        authority: values.authority,
        catpawconfig: values.catpawconfigPDA,
        catpawAccountA: values.catpawAccountA,
        catpawAccountCwv: values.catpawAccountCWV,
      })
      .rpc()

    const gamerTokenAAmount1 = await connection
      .getTokenAccountBalance(values.gamerAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("gamerTokenAAmount1", gamerTokenAAmount1);

    const catpawTokenAAmount1 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("catpawTokenAAmount1", catpawTokenAAmount1);

    const tx = await program.methods
        .startgame(new BN(100).mul(new BN(10 ** 9)), [...values.force.toBuffer()])
        .accounts({
          gamer: values.gamer.publicKey,
          random: values.random,
          treasury: values.random_treasury,
          config: networkStateAccountAddress(),
          vrf: values.vrf.programId,
          gamerAccountA: values.gamerAccountA,
          storeamount: values.storeamountPDA,
          catpawconfig: values.catpawconfigPDA,
          catpawAccountA: values.catpawAccountA,
        })
        .signers([values.gamer])
        .rpc({ skipPreflight: false });

    console.log("transaction: ", tx);
    
    const gamerTokenAAmount2 = await connection
      .getTokenAccountBalance(values.gamerAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("gamerTokenAAmount2", gamerTokenAAmount2);

    const catpawTokenAAmount2 = await connection
      .getTokenAccountBalance(values.catpawAccountA)
      .then((data) => {
        return data.value.amount;
      })
      .catch(() => {
        return 0;
      });

    console.log("catpawTokenAAmount2", catpawTokenAAmount2);

    expect(Number(gamerTokenAAmount2)).to.equal(Number(gamerTokenAAmount1) - Number(new BN(100).mul(new BN(10 ** 9))));
    expect(Number(catpawTokenAAmount2)).to.equal(Number(catpawTokenAAmount1) + Number(new BN(100).mul(new BN(10 ** 9))));

    const amountData = await program.account.storeAmount.fetch(values.storeamountPDA);
    expect(Number(amountData.amount)).to.equal(Number(new BN(100).mul(new BN(10 ** 9))));
  });

  // it("Game finish!", async () => {

  //   await mintingTokens({
  //     connection: connection,
  //     creator: values.cwv_treasury,
  //     mintAKeypair: values.mintCWVKeypair,
  //     program,
  //   })

  //   await mintingTokens({
  //     connection: connection,
  //     creator: values.gamer,
  //     mintAKeypair: values.mintAKeypair,
  //     program,
  //   })

  //   await program.methods
  //     .init()
  //     .accounts({
  //       mintTokenA: values.mintAKeypair.publicKey, 
  //       mintTokenCwv: values.mintCWVKeypair.publicKey,
  //       storeAccount: values.authority,
  //       authority: values.authority,
  //       catpawconfig: values.catpawconfigPDA,
  //       catpawAccountA: values.catpawAccountA,
  //       catpawAccountCwv: values.catpawAccountCWV,
  //     })
  //     .rpc()

  //   const configData = await program.account.catpawConfig.fetch(values.catpawconfigPDA);

  //   const cwv_treasuryTokenCWVAmount1 = await connection
  //     .getTokenAccountBalance(values.cwvtreasureAccountCWV)
  //     .then((data) => {
  //       data.value.amount;
  //     })
  //     .catch(() => {
  //       return 0;
  //     });

  //   console.log("cwv_treasuryTokenCWVAmount1", cwv_treasuryTokenCWVAmount1);

  //   const catpawTokenCWVAmount1 = await connection
  //     .getTokenAccountBalance(values.catpawAccountCWV)
  //     .then((data) => {
  //       data.value.amount;
  //     })
  
  //     .catch(() => {
  //       return 0;
  //     });

  //   console.log("catpawTokenCWVAmount1", catpawTokenCWVAmount1);

  //   await expectRevert(
  //     program.methods
  //     .depositCwv(new BN(1000).mul(new BN(10 ** 9)))
  //     .accounts({
  //       mintTokenCwv: values.mintCWVKeypair.publicKey,
  //       treasuryAccountCwv: values.cwvtreasureAccountCWV,
  //       authority: values.authority,
  //       catpawAccountCwv: values.catpawAccountCWV
  //     })
  //     .signers([values.cwv_treasury])
  //     .rpc()
  //   );

  //   const cwv_treasuryTokenCWVAmount2 = await connection
  //     .getTokenAccountBalance(values.cwvtreasureAccountCWV)
  //     .then((data) => {
  //       data.value.amount;
  //     })
  //     .catch(() => {
  //       return 0;
  //     });

  //   console.log("cwv_treasuryTokenCWVAmount2", cwv_treasuryTokenCWVAmount2);

  //   const catpawTokenCWVAmount2 = await connection
  //     .getTokenAccountBalance(values.catpawAccountCWV)
  //     .then((data) => {
  //       data.value.amount;
  //     })
  //     .catch(() => {
  //       return 0;
  //     });

  //   console.log("catpawTokenCWVAmount2", catpawTokenCWVAmount2);

  //   expect(Number(cwv_treasuryTokenCWVAmount2)).to.equal(Number(cwv_treasuryTokenCWVAmount2) - Number(new BN(1000).mul(new BN(10 ** 9))));
  //   expect(Number(catpawTokenCWVAmount2)).to.equal(Number(catpawTokenCWVAmount2) + Number(new BN(1000).mul(new BN(10 ** 9))));

  //   await program.methods
  //   .startgame(new BN(100).mul(new BN(10 ** 9)), [...values.force.toBuffer()])
  //   .accounts({
  //     random: values.random,
  //     treasury: values.random_treasury,
  //     config: networkStateAccountAddress(),
  //     vrf: values.vrf.programId,
  //     gamerAccountA: values.gamerAccountA,
  //     storeamount: values.storeamountPDA,
  //     catpawconfig: values.catpawconfigPDA,
  //     catpawAccountA: values.catpawAccountA,
  //   })
  //   .signers([values.gamer])
  //   .rpc()

  //   const gamerTokenCWVAmount1 = await connection
  //     .getTokenAccountBalance(values.gamerAccountCWV)
  //     .then((data) => {
  //       data.value.amount;
  //     })
  //     .catch(() => {
  //       return 0;
  //     });

  //   console.log("gamerTokenCWVAmount1", gamerTokenCWVAmount1);

  //   sleep(15);

  //   await expectRevert(
  //     program.methods
  //     .finishGame()
  //     .accounts({
  //       mintTokenCwv: values.mintCWVKeypair.publicKey,
  //       random: values.random,
  //       treasury: values.random_treasury,
  //       config: networkStateAccountAddress(),
  //       vrf: values.vrf.programId,
  //       storeamount: values.storeamountPDA,
  //       gamerAccountCwv: values.gamerAccountCWV,
  //       authority: values.authority,
  //       catpawAccountCwv: values.catpawAccountCWV,
  //     })
  //     .signers([values.gamer])
  //     .rpc()
  //   );

  //   const gamerTokenCWVAmount2 = await connection
  //     .getTokenAccountBalance(values.gamerAccountCWV)
  //     .then((data) => {
  //       data.value.amount;
  //     })
  //     .catch(() => {
  //       return 0;
  //     });

  //   let randomnessFulfilled = await values.vrf.waitFulfilled(values.force.toBuffer());
  //   let randomNumber = Buffer.from(randomnessFulfilled.randomness).readBigInt64LE();
  //   console.log(randomNumber);

  //   console.log("gamerTokenCWVAmount2", gamerTokenCWVAmount2);

  //   expect(Number(gamerTokenCWVAmount2)).to.equal(Number(gamerTokenCWVAmount1) + Number(new BN(100).mul(new BN(10 ** 9)).mul(new BN(Number(randomNumber)))));
  // });

  // it("Change A token address", async () => {

  //   await mintingTokens({
  //     connection: connection,
  //     creator:  values.gamer,
  //     mintAKeypair: values.mintAKeypair,
  //     program,
  //   });

  //   await mintingTokens({
  //     connection: connection,
  //     creator:  values.cwv_treasury,
  //     mintAKeypair: values.newMintAKeypair,
  //     program,
  //   });

  //   await mintingTokens({
  //     connection: connection,
  //     creator:  values.cwv_treasury,
  //     mintAKeypair: values.mintCWVKeypair,
  //     program,
  //   });

  //   await program.methods
  //     .init()
  //     .accounts({
  //       mintTokenA: values.mintAKeypair.publicKey, 
  //       mintTokenCwv: values.mintCWVKeypair.publicKey,
  //       storeAccount: values.authority,
  //       authority: values.authority,
  //       catpawconfig: values.catpawconfigPDA,
  //       catpawAccountA: values.catpawAccountA,
  //       catpawAccountCwv: values.catpawAccountCWV,
  //     })
  //     .rpc()

  //   await expectRevert(
  //     program.methods
  //     .changeA()
  //     .accounts({
  //       newMintTokenA: values.newMintAKeypair.publicKey,
  //       authority: values.authority,
  //       catpawconfig: values.catpawconfigPDA,
  //       catpawAccountA: values.catpawAccountA,
  //     })
  //     .rpc()
  //   );
  //   const accountData = await program.account.catpawConfig.fetch(values.catpawconfigPDA);
  //   expect(accountData.mintTokenA.toString()).to.equal(values.newMintAKeypair.publicKey.toString());
  // });

  // it("Change Storing address", async () => {

  //   await mintingTokens({
  //     connection: connection,
  //     creator: values.cwv_treasury,
  //     mintAKeypair: values.mintCWVKeypair,
  //     program,
  //   })

  //   await mintingTokens({
  //     connection: connection,
  //     creator: values.gamer,
  //     mintAKeypair: values.mintAKeypair,
  //     program,
  //   })

  //   await program.methods
  //     .init()
  //     .accounts({
  //       mintTokenA: values.mintAKeypair.publicKey, 
  //       mintTokenCwv: values.mintCWVKeypair.publicKey,
  //       storeAccount: values.authority,
  //       authority: values.authority,
  //       catpawconfig: values.catpawconfigPDA,
  //       catpawAccountA: values.catpawAccountA,
  //       catpawAccountCwv: values.catpawAccountCWV,
  //     })
  //     .rpc()

  //   await expectRevert(
  //     program.methods
  //     .changeTo()
  //     .accounts({
  //       newToAccount: values.newStoringKeypair.publicKey,
  //       catpawconfig: values.catpawconfigPDA,
  //       mintTokenA: values.mintAKeypair.publicKey,
  //       catpawAccountCwv: values.catpawAccountCWV,
  //     })
  //     .rpc()
  //   );
  //   const accountData = await program.account.catpawConfig.fetch(values.catpawconfigPDA);
  //   expect(accountData.storeTokenA.toString()).to.equal(values.newStoringKeypair.publicKey.toString());
  // });

  // it("Withdraw", async () => {

  //   await mintingTokens({
  //     connection: connection,
  //     creator: values.cwv_treasury,
  //     mintAKeypair: values.mintCWVKeypair,
  //     program,
  //   })

  //   await mintingTokens({
  //     connection: connection,
  //     creator: values.gamer,
  //     mintAKeypair: values.mintAKeypair,
  //     program,
  //   })

  //   await program.methods
  //     .init()
  //     .accounts({
  //       mintTokenA: values.mintAKeypair.publicKey, 
  //       mintTokenCwv: values.mintCWVKeypair.publicKey,
  //       storeAccount: values.authority,
  //       authority: values.authority,
  //       catpawconfig: values.catpawconfigPDA,
  //       catpawAccountA: values.catpawAccountA,
  //       catpawAccountCwv: values.catpawAccountCWV,
  //     })
  //     .rpc()

  //   const configData = await program.account.catpawConfig.fetch(values.catpawconfigPDA);

  //   await program.methods
  //   .startgame(new BN(100).mul(new BN(10 ** 9)), [...values.force.toBuffer()])
  //   .accounts({
  //     random: values.random,
  //     treasury: values.random_treasury,
  //     config: networkStateAccountAddress(),
  //     vrf: values.vrf.programId,
  //     gamerAccountA: values.gamerAccountA,
  //     storeamount: values.storeamountPDA,
  //     catpawconfig: values.catpawconfigPDA,
  //     catpawAccountA: values.catpawAccountA,
  //   })
  //   .signers([values.gamer])
  //   .rpc({ skipPreflight: true })

  //   const catpawAccountCWV = getAssociatedTokenAddressSync(
  //     values.mintCWVKeypair.publicKey,
  //     values.authority,
  //     true
  //   );

  //   const catpawTokenACWVmount = await connection
  //     .getTokenAccountBalance(catpawAccountCWV)
  //     .then((data) => {
  //       data.value.amount;
  //     })
  //     .catch(() => {
  //       return 0;
  //     });

  //   await expectRevert(
  //     program.methods
  //     .withdrawA(new BN(Number(catpawTokenACWVmount)))
  //     .accounts({
  //       mintTokenCwv: values.mintCWVKeypair.publicKey,
  //       withdrawAccount: values.withdrawKeypair.publicKey,
  //       catpawconfig: values.catpawconfigPDA,
  //       authority: values.authority,
  //       catpawAccountCwv: values.catpawAccountCWV,
  //     })
  //     .rpc()
  //   );

  //   const withdrawAccountCWV = getAssociatedTokenAddressSync(
  //     values.mintCWVKeypair.publicKey,
  //     values.withdrawKeypair.publicKey,
  //     true
  //   );

  //   const withdrawTokenACWVmount = await connection
  //     .getTokenAccountBalance(withdrawAccountCWV)
  //     .then((data) => {
  //       data.value.amount;
  //     })
  //     .catch(() => {
  //       return 0;
  //     });

  //   expect(Number(withdrawTokenACWVmount)).to.equal(Number(catpawTokenACWVmount));
  // });
});
