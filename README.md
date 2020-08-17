<div align="center">
  <img src="media/purser_color.svg" width="600" />
</div>

## Purser

Purser simplifies interaction with Ethereum based wallets. It supports both hardware and software wallets and provides a consistent and predictable interface to work with during dApp development.

Purser is:

**Simple** - Has an easy and intuitive API. Get started in minutes!

**Predictable** - Uses the same commands for all wallet types.

**Sane** - Maintains developer health by using proper error messages, validations and sanitisers.

**Plug & Play** - Supports Hardware (Ledger, Trezor) and Software (ethers.js) wallets out of the box.

Purser was brought to you by the fine folks at [Colony](https://github.com/JoinColony). To learn more about Colony, you can visit [the website](https://colony.io/) or read the [white paper](https://colony.io/whitepaper.pdf).

### Quickstart (software wallet)

To use the **software wallet** (based on the [ethers wallet](https://github.com/ethers-io/ethers.js/)):

#### Installation

```
npm install @purser/software
```

#### Usage

Create a new wallet

```js
import { create } from '@purser/software'

const wallet = await create();

console.log(wallet); // { address: '...', privateKey: '...', publicKey: '...' }
```

or open an existing one (based on the mnemnonic)

```js
import { open } from '@purser/software'

const wallet = await open({ mnemonic: '...' });

console.log(wallet); // { address: '...', privateKey: '...', publicKey: '...' }
```

### Documentation

Please see the [documentation](https://joincolony.github.io/purser/) with detailed examples and explanations.

### Packages

Purser is a monorepo consisting of a collection of Ethereum wallet libraries:
- [`@purser/core`](https://github.com/JoinColony/purser/blob/master/packages/@purser/core): A collection of `helpers`, `utils`, `validators` and `normalizers` to assist the individual purser modules.
- [`@purser/metamask`](https://github.com/JoinColony/purser/blob/master/packages/@purser/metamask): A `javascript` library to interact with the a [Metamask](https://metamask.io/) based Ethereum wallet.
- [`@purser/software`](https://github.com/JoinColony/purser/blob/master/packages/@purser/software): A `javascript` library to interact with a software Ethereum wallet, based on the [ethers.js](https://github.com/ethers-io/ethers.js/) library.

### The future

We plan to add support more hardware wallets and other features that will make wallet interactions even easier. Stay tuned!

### Contributing

We welcome all contributions to Purser. You can help by adding support for new wallet types, testing existing wallets, or improving the documentation.

Please read our [Contributing Guidelines](https://github.com/JoinColony/purser/blob/master/.github/CONTRIBUTING.md) for how to get started.

### License

The purser monorepo and each individual purser library are [MIT licensed](LICENSE).
