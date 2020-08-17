## [@purser/signer-ethers](https://www.npmjs.com/package/@purser/signer-ethers)

This package allows you to use any purser wallet as an [ethers.js signer](https://docs.ethers.io/v4/api-wallet.html#signer).

### Installation

```shell
npm install ethers @purser/signer-ethers
```

### Quick Usage (using a MetaMask purser wallet)

```typescript
import { getDefaultProvider } from "ethers";
import { create } from "@purser/metamask";
import { EthersSigner } from "@purser/signer-ethers";

const provider = getDefaultProvider("ropsten");

const initSigner = async () => {
  const wallet = await create();
  const signer = new EthersSigner({ purserWallet: wallet, provider });
};
```

You can then use the signer to [connect to Ethereum contracts with ethers](https://docs.ethers.io/v4/api-contract.html#connecting-to-a-contract).

### Documentation

You can find more in-depth description for this module's API in the [purser docs](https://joincolony.github.io/purser/modules/_purser_signer_ethers.html).

### Contributing

This package is part of the [purser monorepo](https://github.com/JoinColony/purser) package.

Please read our [Contributing Guidelines](https://github.com/JoinColony/purser/blob/master/.github/CONTRIBUTING.md) for how to get started.

### License

The `@purser/core` library along with the whole purser monorepo are [MIT licensed](https://github.com/JoinColony/purser/blob/master/LICENSE).
