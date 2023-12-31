import * as path from "path";
import * as dotenv from "dotenv";
import prompts from "prompts";

import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goerli, mainnet, Chain } from "viem/chains";

import { deposit } from "./deposit";
import { swap } from "./swap";
import { withdraw } from "./withdraw";

// Load environment variables from `.env.local`
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const params: prompts.PromptObject<any>[] = [
  {
    type: "select",
    name: "chain",
    message: "Select your chain",
    choices: [
      {
        title: "goerli",
        description: "Ethereum Testnet (Goerli)",
        value: goerli,
      },
      { title: "mainnet", description: "Ethereum Mainnet", value: mainnet },
    ],
    initial: 0,
  },
  {
    type: "select",
    name: "action",
    message: "Select an action",
    choices: [
      {
        title: "swap",
        description: "Swap ETH for a staked ETH variant",
        value: "swap",
      },
      { title: "deposit", description: "Deposit staked ETH", value: "deposit" },
      { title: "both", description: "Both!", value: "both" },
    ],
    initial: 0,
  },
  {
    type: "select",
    name: "asset",
    message: "Select your desired staked ETH variant",
    choices: [
      { title: "cbETH", description: "Coinbase Staked ETH", value: "cbETH" },
      { title: "stETH", description: "Lido Staked ETH", value: "stETH" },
      { title: "rETH", description: "Rocket Pool Staked ETH", value: "rETH" },
      { title: "ETHx", description: "Stader Labs Staked ETH", value: "ETHx" },
    ],
    initial: 0,
  },
  {
    type: "text",
    name: "amount",
    message: "Amount of ETH to stake",
  },
];

function createConnectedClient(chain: Chain) {
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  const nodeUrl =
    chain.name.toLowerCase() === "goerli"
      ? `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY!}`
      : `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY!}`;

  return createWalletClient({
    account,
    chain,
    transport: http(nodeUrl),
  }).extend(publicActions);
}

async function main() {
  const { chain, action, asset, amount } = await prompts(params);
  const client = createConnectedClient(chain);

  switch (action) {
    case "swap":
      return await swap(client, chain, asset, amount);
    case "deposit":
      return await deposit(client, chain, asset, amount);
    case "both":
      await swap(client, chain, asset, amount);
      return await deposit(client, chain, asset, amount);
    default:
      break;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
