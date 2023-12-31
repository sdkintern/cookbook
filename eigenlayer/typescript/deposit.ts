import { formatEther, parseEther } from "viem";

import { addresses, ChainType } from "./constants";
import rETHTokenAbi from "./abi/rETHTokenAbi.json";
import stETHTokenAbi from "./abi/stETHTokenAbi.json";
import eigenlayerStrategyManagerAbi from "./abi/eigenlayerStrategyManagerAbi.json";

// Deposit handler
export async function deposit(
  client: any,
  chain: ChainType,
  asset: string,
  amount: string
) {
  console.log(`Depositing ${amount} ${asset} on ${chain.network}...`);

  switch (asset) {
    case "stETH":
      return await depositStETH(client, chain, amount);
    case "rETH":
      return await depositRETH(client, chain, amount);
    default:
      return;
  }
}

async function depositStETH(client: any, chain: ChainType, amount: string) {
  const { strategyContract, tokenContract } = addresses[chain.network].stETH;

  // First, check if balance is sufficient to make the deposit
  const balance = (await client.readContract({
    address: tokenContract,
    abi: stETHTokenAbi,
    functionName: "balanceOf",
    args: [client.account.address],
  })) as bigint;

  if (parseEther(amount) > balance) {
    throw new Error(
      `Insufficient balance: have ${formatEther(
        balance
      )} stETH, want ${amount} stETH.`
    );
  }

  // Next, check allowance and approve if necessary
  const allowance = (await client.readContract({
    address: tokenContract,
    abi: stETHTokenAbi,
    functionName: "allowance",
    args: [client.account.address, addresses[chain.network].eigenlayerContract], // owner, spender
  })) as bigint;

  if (parseEther(amount) > allowance) {
    console.log(`Insufficient stETH allowance: ${allowance}. Approving...`);

    const approveTxHash = await client.writeContract({
      account: client.account,
      chain,
      abi: stETHTokenAbi,
      address: tokenContract,
      functionName: "approve",
      args: [addresses[chain.network].eigenlayerContract, parseEther(amount)],
    });

    await client.waitForTransactionReceipt({ hash: approveTxHash });

    console.log(
      `Approved ${amount} stETH for depositing into Eigenlayer contract. See tx details: https://goerli.etherscan.io/tx/${approveTxHash}`
    );
  }

  // Finally, deposit
  const depositTxHash = await client.writeContract({
    account: client.account,
    chain,
    abi: eigenlayerStrategyManagerAbi,
    address: addresses[chain.network].eigenlayerContract,
    functionName: "depositIntoStrategy",
    args: [strategyContract, tokenContract, parseEther(amount)], // strategy, token, amount
  });

  await client.waitForTransactionReceipt({ hash: depositTxHash });

  console.log(
    `Deposited ${amount} stETH into Eigenlayer contract. See tx details: https://goerli.etherscan.io/tx/${depositTxHash}`
  );
}

async function depositRETH(client: any, chain: ChainType, amount: string) {
  const { strategyContract, tokenContract } = addresses[chain.network].stETH;

  // First, check if balance is sufficient to make the deposit
  const balance = (await client.readContract({
    address: tokenContract,
    abi: rETHTokenAbi,
    functionName: "balanceOf",
    args: [client.account.address],
  })) as bigint;

  if (parseEther(amount) > balance) {
    throw new Error(
      `Insufficient balance: have ${formatEther(
        balance
      )} rETH, want ${amount} rETH.`
    );
  }

  // Next, check allowance and approve if necessary
  const allowance = (await client.readContract({
    address: tokenContract,
    abi: rETHTokenAbi,
    functionName: "allowance",
    args: [client.account.address, addresses[chain.network].eigenlayerContract], // owner, spender
  })) as bigint;

  if (parseEther(amount) > allowance) {
    console.log(`Insufficient rETH allowance: ${allowance}. Approving...`);

    const approveTxHash = await client.writeContract({
      account: client.account,
      chain,
      abi: rETHTokenAbi,
      address: tokenContract,
      functionName: "approve",
      args: [addresses[chain.network].eigenlayerContract, parseEther(amount)],
    });

    await client.waitForTransactionReceipt({ hash: approveTxHash });

    console.log(
      `Approved ${amount} rETH for depositing into Eigenlayer contract. See tx details: https://goerli.etherscan.io/tx/${approveTxHash}`
    );
  }

  // Finally, deposit
  const depositTxHash = await client.writeContract({
    account: client.account,
    chain,
    abi: eigenlayerStrategyManagerAbi,
    address: addresses[chain.network].eigenlayerContract,
    functionName: "depositIntoStrategy",
    args: [strategyContract, tokenContract, parseEther(amount)], // strategy, token, amount
  });

  await client.waitForTransactionReceipt({ hash: depositTxHash });

  console.log(
    `Deposited ${amount} rETH into Eigenlayer contract. See tx details: https://goerli.etherscan.io/tx/${depositTxHash}`
  );
}
