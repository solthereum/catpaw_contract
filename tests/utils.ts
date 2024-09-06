import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, Connection, Signer } from "@solana/web3.js";
import { createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { randomnessAccountAddress, Orao } from "@orao-network/solana-vrf";
require("dotenv").config();

const fs = require("fs");

export const expectRevert = async (promise: Promise<any>) => {
  try {
    await promise;
    throw new Error("Expected a revert");
  } catch {
    return;
  }
};

export async function sleep(seconds: number) {
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// export const mintingTokens = async ({
//   connection,
//   creator,
//   holder = creator,
//   mintAKeypair,
//   mintedAmount = 1000,
//   decimals = 9,
// }: {
//   connection: Connection;
//   creator: Signer;
//   holder?: Signer;
//   mintAKeypair: Keypair;
//   mintedAmount?: number;
//   decimals?: number;
// }) => {
//   await createMint(connection, creator, creator.publicKey, creator.publicKey, decimals, mintAKeypair);
//   await getOrCreateAssociatedTokenAccount(connection, holder, mintAKeypair.publicKey, holder.publicKey, true);
//   await mintTo(
//     connection,
//     creator,
//     mintAKeypair.publicKey,
//     getAssociatedTokenAddressSync(mintAKeypair.publicKey, holder.publicKey, true),
//     creator.publicKey,
//     mintedAmount * 10 ** decimals,
//   );
// };

export const mintingTokens = async ({
  connection,
  creator,
  mintAKeypair,
  program,
}: {
  connection: Connection;
  creator: Signer;
  holder?: Signer;
  mintAKeypair: Keypair;
  mintedAmount?: number;
  program: any;
}) => {
  const metadata = {
    name: "Rocket Fun",
    symbol: "ROCKETFUN",
    uri: "https://gateway.pinata.cloud/ipfs/QmRRn1UZJHKjLbq2EtZcrEjn2qeUX6B2cjYLir233Dk5vn",
  };

  const associatedTokenAccount = await getAssociatedTokenAddressSync(
    mintAKeypair.publicKey,
    creator.publicKey
  );

  // Derive PDA for metadata account
  const [metadataPDA, _] = await PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
      mintAKeypair.publicKey.toBuffer(),
    ],
    new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s") // The public key of the token metadata program
  );

  const tx = await program.methods
    .createTokenMint(metadata.name, metadata.symbol, metadata.uri)
    .accounts({
      payer: creator.publicKey,
      mintAccount: mintAKeypair.publicKey,
      associatedTokenAccount,
      metadataAccount: metadataPDA,
      tokenMetadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    })
    .signers([mintAKeypair, creator])
    .rpc();

  // Fetch and decode the metadata account
  const metadataAccountInfo = await connection.getAccountInfo(metadataPDA);
  if (metadataAccountInfo === null) {
    throw new Error("Failed to fetch metadata account info");
  }
};

export interface TestValues {
  cwv_treasury: Keypair;
  gamer: Keypair;
  catpawconfigPDA: PublicKey;
  storeamountPDA: PublicKey;
  authority: PublicKey;
  mintAKeypair: Keypair;
  mintCWVKeypair: Keypair;
  storeKeypair: Keypair;
  newMintAKeypair: Keypair;
  newStoringKeypair: Keypair;
  withdrawKeypair: Keypair;
  gamerAccountA: PublicKey;
  catpawAccountA: PublicKey;
  gamerAccountCWV: PublicKey;
  catpawAccountCWV: PublicKey;
  cwvtreasureAccountCWV: PublicKey;
  vrf: Orao;
  random: PublicKey;
  random_treasury: PublicKey;
  force: PublicKey;
}

export function createValues(): TestValues {

  const cwv_treasury_secretKey = JSON.parse(fs.readFileSync("./seeds/id.json", "utf8"));
  const cwv_treasury = Keypair.fromSecretKey(new Uint8Array(cwv_treasury_secretKey));

  const gamer_secretKey = JSON.parse(fs.readFileSync("./seeds/gamer.json", "utf8"));
  const gamer = Keypair.fromSecretKey(new Uint8Array(gamer_secretKey));

  const [catpawconfigPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("catpawconfig")],
    anchor.workspace.Catpaw.programId,
  );

  const [storeamountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("storeamount"), gamer.publicKey.toBuffer()],
    anchor.workspace.Catpaw.programId,
  );

  const [authority] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    anchor.workspace.Catpaw.programId,
  );

  const mintAKeypair = Keypair.generate();

  const mintCWVKeypair = Keypair.generate();

  const storeKeypair = Keypair.generate();

  const newMintAKeypair = Keypair.generate();

  const newStoringKeypair = Keypair.generate();

  const withdrawKeypair = Keypair.generate();

  const gamerAccountA = getAssociatedTokenAddressSync(
    mintAKeypair.publicKey,
    gamer.publicKey,
    true
  );

  const catpawAccountA = getAssociatedTokenAddressSync(
    mintAKeypair.publicKey,
    authority,
    true
  );

  const gamerAccountCWV = getAssociatedTokenAddressSync(
    mintCWVKeypair.publicKey,
    gamer.publicKey,
    true
  );

  const catpawAccountCWV = getAssociatedTokenAddressSync(
    mintCWVKeypair.publicKey,
    authority,
    true
  );

  const cwvtreasureAccountCWV = getAssociatedTokenAddressSync(
    mintCWVKeypair.publicKey,
    cwv_treasury.publicKey,
    true
  );

  let force = Keypair.generate().publicKey;
  
  const vrf = new Orao(anchor.getProvider() as any);
  // const random = randomnessAccountAddress(force.toBuffer());
  
  const [random] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("orao-vrf-randomness-request"),
      // force.toBuffer()
      Buffer.from("random")
    ],
    new PublicKey("VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y")
  );

  const random_treasury = new PublicKey("9ZTHWWZDpB36UFe1vszf2KEpt83vwi27jDqtHQ7NSXyR");

  return {
    cwv_treasury,
    gamer,
    catpawconfigPDA,
    storeamountPDA,
    authority,
    mintAKeypair,
    mintCWVKeypair,
    storeKeypair,
    newMintAKeypair,
    newStoringKeypair,
    withdrawKeypair,
    gamerAccountA,
    catpawAccountA,
    gamerAccountCWV,
    catpawAccountCWV,
    cwvtreasureAccountCWV,
    vrf,
    random,
    random_treasury,
    force,
  };
}