## [@colony/](https://www.npmjs.com/org/colony)purser-metamask

A `javascript` library to interact with the a [Metamask](https://metamask.io/) based Ethereum wallet.

It extracts all the complexity from setting up, maintaining and interacting with it, while providing you with a [predictable interface](https://docs.colony.io/purser/interface-common-wallet-interface/).

### Installation
```js
yarn add @colony/purser-metamask
```

### Quick Usage
```js
import { open } from '@colony/purser-metamask'

const wallet = await open();

console.log(wallet); // { address: '...', chainId: '...', publicKey: '...' }
```

### Documentation

You can find more in-depth description for this module's API in the [purser docs](https://docs.colony.io/purser/modules-@colonypurser-metamask/).

### Contributing

This package is part of the [purser monorepo](https://github.com/JoinColony/purser) package.

Please read our [Contributing Guidelines](https://github.com/JoinColony/purser/blob/master/.github/CONTRIBUTING.md) for how to get started.

### License

The `purser-metamask` library along with the whole purser monorepo are [MIT licensed](https://github.com/JoinColony/purser/blob/master/LICENSE).
