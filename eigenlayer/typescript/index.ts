import * as path from "path";
import * as dotenv from "dotenv";

import {
  createWalletClient,
  http,
  parseEther,
  formatEther,
  publicActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli } from "viem/chains";

import erc20Abi from "./erc20Abi.json";
import staderAbi from "./staderAbi.json";
import rETHTokenAbi from "./rETHTokenAbi.json";
import stETHTokenAbi from "./stETHTokenAbi.json";
import eigenlayerStrategyManagerAbi from "./eigenlayerStrategyManagerAbi.json";

// Load environment variables from `.env.local`
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const client = createWalletClient({
  account,
  chain: goerli,
  transport: http(`https://goerli.infura.io/v3/${process.env.INFURA_API_KEY!}`),
}).extend(publicActions);

// See deployments: https://github.com/Layr-Labs/eigenlayer-contracts?tab=readme-ov-file#deployments
// These are accurate as of 12/28/2023.
const staderContract = "0xd0e400Ec6Ed9C803A9D9D3a602494393E806F823";
const ETHxToken = "0x3338eCd3ab3d3503c55c931d759fA6d78d287236";
const eigenlayerContract = "0x779d1b5315df083e3F9E94cB495983500bA8E907";
const stETHToken = "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F";
const stETHStrategyContract = "0xB613E78E2068d7489bb66419fB1cfa11275d14da";
const rETHToken = "0x178E141a0E3b34152f73Ff610437A7bf9B83267A";
const rETHStrategyContract = "0x879944A8cB437a5f8061361f82A6d4EED59070b5";

// Obtaining stETH on Goerli requires a simple send of goETH, for which you will be sent a corresponding amount of stETH.
// LDO/stETH token: 0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F
// wstETH token: 0x6320cd32aa674d2898a68ec82e869385fc5f7e2f
// See more details at https://docs.eigenlayer.xyz/restaking-guides/restaking-user-guide/stage-2-testnet/obtaining-testnet-eth-and-liquid-staking-tokens-lsts
async function swapForStETH() {
  const amount = "0.00001";
  const txHash = await client.sendTransaction({
    chain: goerli,
    account,
    to: stETHToken as `0x${string}`,
    value: parseEther(amount),
  });

  await client.waitForTransactionReceipt({ hash: txHash });

  console.log(
    `Deposited ${amount} goETH into stETH contract. See tx details: https://goerli.etherscan.io/tx/${txHash}`
  );

  // Check amount of stETH given back
  const data = await client.readContract({
    address: stETHToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });

  console.log(`stETH balance: ${data}`);
}

async function swapForRETH() {
  // TODO
  // Swap via Uniswap
}

async function swapForAnkrETH() {
  // TODO
}

// ETHx is Stader Labs implementation of staked ETH.
async function swapForETHx() {
  const amount = "0.01"; // minimum amount is enforced
  const txHash = await client.writeContract({
    account,
    chain: goerli,
    abi: staderAbi,
    address: staderContract,
    functionName: "deposit",
    args: [account.address],
    value: parseEther(amount),
  });

  await client.waitForTransactionReceipt({ hash: txHash });

  console.log(
    `Deposited ${amount} goETH into stETH contract. See tx details: https://goerli.etherscan.io/tx/${txHash}`
  );

  // Check amount of ETHx given back
  const data = await client.readContract({
    address: ETHxToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });

  console.log(`ETHx balance: ${formatEther(data as bigint)}`);
}

async function depositStETH() {
  const amount = "0.0001";

  // First, check allowance and approve if necessary
  const allowance = (await client.readContract({
    address: stETHToken,
    abi: stETHTokenAbi,
    functionName: "allowance",
    args: [account.address, eigenlayerContract], // owner, spender
  })) as bigint;

  if (parseEther(amount) > allowance) {
    console.log(`Insufficient stETH allowance: ${allowance}. Approving...`);

    const approveTxHash = await client.writeContract({
      account,
      chain: goerli,
      abi: stETHTokenAbi,
      address: stETHToken,
      functionName: "approve",
      args: [eigenlayerContract, parseEther(amount)],
    });

    await client.waitForTransactionReceipt({ hash: approveTxHash });

    console.log(
      `Approved ${amount} stETH for depositing into Eigenlayer contract. See tx details: https://goerli.etherscan.io/tx/${approveTxHash}`
    );
  }

  // Next, deposit
  const depositTxHash = await client.writeContract({
    account,
    chain: goerli,
    abi: eigenlayerStrategyManagerAbi,
    address: eigenlayerContract,
    functionName: "depositIntoStrategy",
    args: [stETHStrategyContract, stETHToken, parseEther(amount)], // strategy, token, amount
  });

  await client.waitForTransactionReceipt({ hash: depositTxHash });

  console.log(
    `Deposited ${amount} stETH into Eigenlayer contract. See tx details: https://goerli.etherscan.io/tx/${depositTxHash}`
  );
}

async function depositRETH() {
  const amount = "0.0001";

  // First, check allowance and approve if necessary
  const allowance = (await client.readContract({
    address: rETHToken,
    abi: rETHTokenAbi,
    functionName: "allowance",
    args: [account.address, eigenlayerContract], // owner, spender
  })) as bigint;

  if (parseEther(amount) > allowance) {
    console.log(`Insufficient rETH allowance: ${allowance}. Approving...`);

    const approveTxHash = await client.writeContract({
      account,
      chain: goerli,
      abi: rETHTokenAbi,
      address: rETHToken,
      functionName: "approve",
      args: [eigenlayerContract, parseEther(amount)],
    });

    await client.waitForTransactionReceipt({ hash: approveTxHash });

    console.log(
      `Approved ${amount} rETH for depositing into Eigenlayer contract. See tx details: https://goerli.etherscan.io/tx/${approveTxHash}`
    );
  }

  // Next, deposit
  const depositTxHash = await client.writeContract({
    account,
    chain: goerli,
    abi: eigenlayerStrategyManagerAbi,
    address: eigenlayerContract,
    functionName: "depositIntoStrategy",
    args: [rETHStrategyContract, rETHToken, parseEther(amount)], // strategy, token, amount
  });

  await client.waitForTransactionReceipt({ hash: depositTxHash });

  console.log(
    `Deposited ${amount} rETH into Eigenlayer contract. See tx details: https://goerli.etherscan.io/tx/${depositTxHash}`
  );
}

async function withdraw() {
  // TODO
}

async function main() {
  // await swapForStETH();
  // await swapForETHx();
  // await depositRETH();
  await depositStETH();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
