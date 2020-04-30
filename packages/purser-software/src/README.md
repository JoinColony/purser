## [@colony/](https://www.npmjs.com/org/colony)purser-software

A `javascript` library to interact with a software Ethereum wallet, based on the [ethers.js](https://github.com/ethers-io/ethers.js/) library.

It extracts all the complexity from setting up, maintaining and interacting with it, while providing you with a [predictable interface](https://docs.colony.io/purser/interface-common-wallet-interface/).

### Installation
```js
yarn add @colony/purser-software
```

### Quick Usage
```js
import { open } from '@colony/purser-software'

const wallet = await open({ mnemonic: '...' });

console.log(wallet); // { address: '...', privateKey: '...', publicKey: '...' }
```

### Documentation

You can find more in-depth description for this module's API in the [purser docs](https://docs.colony.io/purser/modules-@colonypurser-software/).

### Contributing

This package is part of the [purser monorepo](https://github.com/JoinColony/purser) package.

Please read our [Contributing Guidelines](https://github.com/JoinColony/purser/blob/master/.github/CONTRIBUTING.md) for how to get started.

### License

The `purser-software` library along with the whole purser monorepo are [MIT licensed](https://github.com/JoinColony/purser/blob/master/LICENSE).
