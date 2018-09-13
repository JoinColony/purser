---
title: Overview
section: Docs
order: 0
---

The purser library is collection of modules that simplify interaction with Ethereum based wallets. Purser supports both hardware and software wallets and provides a consistent and predictable interface to work with during dApp development.

For a full description of the wallet interface and usage, see [The Common Wallet Interface](/purser/interface-common-wallet-interface/)

### Quick Start

Set-up time for purser is minimal-- just add to your project and go:

##  @colony/purser-core

A collection of `helpers`, `utils`, `validators` and `normalizers` to assist the individual purser modules.

#### Installation

Add the core library:
```js
yarn add @colony/purser-core
```

#### Usage
```js
import { bigNumber } from '@colony/purser-core/utils'

const value = bigNumber('0.00000001').toWei();

console.log(value); // { negative: 0, words: Array(4), length: 4, red: null }
```

## @colony/purser-ledger

A `javascript` library to interact with a [Ledger](https://www.ledger.com/) based Ethereum wallet.

#### Installation
```js
yarn add @colony/purser-ledger
```

#### Usage
```js
import { open } from '@colony/purser-ledger'

const wallet = await open();

await wallet.setDefaultAddress(12); // Optional - Select another address from the ones available

console.log(wallet); // { address: '...', otherAddrresses: [...], publicKey: '...' }
```

## @colony/purser-metamask

A `javascript` library to interact with the a [Metamask](https://metamask.io/) based Ethereum wallet.

### Installation
```js
yarn add @colony/purser-metamask
```

### Usage
```js
import { open } from '@colony/purser-metamask'

const wallet = await open();

console.log(wallet); // { address: '...', chainId: '...', publicKey: '...' }
```

## @colony/purser-software

A `javascript` library to interact with a software Ethereum wallet, based on the [ethers.js](https://github.com/ethers-io/ethers.js/) library.

#### Installation
```js
yarn add @colony/purser-sofware
```

#### Usage
```js
import { open } from '@colony/purser-software'

const wallet = await open({ mnemonic: '...' });

console.log(wallet); // { address: '...', privateKey: '...', publicKey: '...' }
```

## @colony/purser-trezor

A `javascript` library to interact with a [Trezor](https://trezor.io/) based Ethereum wallet.

#### Installation
```js
yarn add @colony/purser-trezor
```

#### Usage
```js
import { open } from '@colony/purser-trezor'

const wallet = await open();

await wallet.setDefaultAddress(12); // Optional - Select another address from the ones available

console.log(wallet); // { address: '...', otherAddrresses: [...], publicKey: '...' }
```
