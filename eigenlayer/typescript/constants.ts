import { goerli, mainnet } from "viem/chains";
import { WalletClient, PublicClient, Client } from "viem";

export type ChainType = typeof mainnet;

// See deployments: https://github.com/Layr-Labs/eigenlayer-contracts?tab=readme-ov-file#deployments
// These are accurate as of 12/28/2023.

export const addresses = {
  goerli: {
    eigenlayerContract: "0x779d1b5315df083e3F9E94cB495983500bA8E907",
    // Stader Labs
    ETHx: {
      tokenContract: "0x3338eCd3ab3d3503c55c931d759fA6d78d287236",
      depositContract: "0xd0e400Ec6Ed9C803A9D9D3a602494393E806F823",
      strategyContract: "",
    },
    stETH: {
      tokenContract: "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F",
      depositContract: "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F", // requires simple send
      strategyContract: "0xB613E78E2068d7489bb66419fB1cfa11275d14da",
    },
    rETH: {
      tokenContract: "0x178E141a0E3b34152f73Ff610437A7bf9B83267A",
      depositContract: "0x178E141a0E3b34152f73Ff610437A7bf9B83267A",
      strategyContract: "0x879944A8cB437a5f8061361f82A6d4EED59070b5",
    },
  },
  mainnet: {
    cbETHStrategyContract: "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc",
    stETHStrategyContract: "0x93c4b944D05dfe6df7645A86cd2206016c51564D",
    rETHStrategyContract: "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2",
    ETHxStrategyContract: "0x9d7eD45EE2E8FC5482fa2428f15C971e6369011d",
    ankrETHStrategyContract: "0x13760F50a9d7377e4F20CB8CF9e4c26586c658ff",
    // unneeded:
    // OETH, osETH, swETH, wBETH
    // below still have to be updated
    staderContract: "0xd0e400Ec6Ed9C803A9D9D3a602494393E806F823",
    ETHxToken: "0x3338eCd3ab3d3503c55c931d759fA6d78d287236",
    eigenlayerContract: "0x779d1b5315df083e3F9E94cB495983500bA8E907",
    stETHToken: "0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F",
    rETHToken: "0x178E141a0E3b34152f73Ff610437A7bf9B83267A",
  },
};
