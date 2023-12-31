import { parseEther, formatEther } from "viem";

import { addresses, ChainType } from "./constants";
import erc20Abi from "./abi/erc20Abi.json";
import staderAbi from "./abi/staderAbi.json";

// Swap handler
export async function swap(
  client: any,
  chain: ChainType,
  asset: string,
  amount: string
) {
  console.log(`Swapping ${amount} ETH for ${asset} on ${chain.network}...`);

  switch (asset) {
    case "stETH":
      return await swapForStETH(client, chain, amount);
    case "ETHx":
      return await swapForETHx(client, chain, amount);
    default:
      return;
  }
}

// Obtaining stETH on Goerli requires a simple send of goETH, for which you will be sent a corresponding amount of stETH.
// LDO/stETH token: 0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F
// wstETH token: 0x6320cd32aa674d2898a68ec82e869385fc5f7e2f
// See more details at https://docs.eigenlayer.xyz/restaking-guides/restaking-user-guide/stage-2-testnet/obtaining-testnet-eth-and-liquid-staking-tokens-lsts
async function swapForStETH(client: any, chain: ChainType, amount: string) {
  const { tokenContract } = addresses[chain.network].stETH;

  const txHash = await client.sendTransaction({
    chain,
    account: client.account,
    to: tokenContract as `0x${string}`,
    value: parseEther(amount),
  });

  await client.waitForTransactionReceipt({ hash: txHash });

  console.log(
    `Deposited ${amount} goETH into stETH contract. See tx details: https://goerli.etherscan.io/tx/${txHash}`
  );

  // Check amount of stETH given back
  const data = await client.readContract({
    address: tokenContract,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [client.account.address],
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

// ETHx is Stader Labs' implementation of staked ETH.
async function swapForETHx(client: any, chain: ChainType, amount: string) {
  const relevantAddresses = addresses[chain.network].ETHx;

  const txHash = await client.writeContract({
    account: client.account,
    chain,
    abi: staderAbi,
    address: relevantAddresses.depositContract,
    functionName: "deposit",
    args: [client.account.address],
    value: parseEther(amount),
  });

  await client.waitForTransactionReceipt({ hash: txHash });

  console.log(
    `Deposited ${amount} goETH into stETH contract. See tx details: https://goerli.etherscan.io/tx/${txHash}`
  );

  // Check amount of ETHx given back
  const data = await client.readContract({
    address: relevantAddresses.tokenContract,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [client.account.address],
  });

  console.log(`ETHx balance: ${formatEther(data as bigint)}`);
}
