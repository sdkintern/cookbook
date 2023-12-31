# typescript implementation

stake LST strategies: https://goerli.eigenlayer.xyz/

- [x] stETH (Lido Staked ETH)
- [x] rETH (Rocket Pool ETH)
- [ ] ETHx (Stader Labs)
- [ ] ankrETH

## usage

```bash
pnpm i
tsx index.ts
```

- [ ] swapForStETH // at limit
- [x] swapForETHx
- [x] depositRETH
- [x] depositStETH

TODO

- [ ] DRY
- [ ] add prominent mainnet strategies
- [ ] read TVL #s from testnet/mainnet
- [ ] (optional) use abitype to make contract calls: https://github.com/wevm/abitype 