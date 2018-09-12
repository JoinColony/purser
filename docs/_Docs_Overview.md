---
title: Overview
section: Docs
order: 0
---

The purser library is collection of modules that allows you better interact with Ethereum based wallets, be they hardware or software, reducing the setup time to almost zero, while providing you with a consistent and predictable interface you can work with.

### Quick Start

##  @colony/purser-core

A collection of `helpers`, `utils`, `validators` and `normalizers` to assist the individual purser modules.

#### Installation
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

const wallet = open();

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

const wallet = open();

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

const wallet = open({ mnemonic: '...' });

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

const wallet = open();

console.log(wallet); // { address: '...', otherAddrresses: [...], publicKey: '...' }
```
