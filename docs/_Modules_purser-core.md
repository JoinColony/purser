---
title: '@colony/purser-core'
section: Modules
order: 0
---

These docs serve to outline the _public_ `API` format and methods provided by the `@colony/purser-core` library.

While there are many more methods available inside this library, only the ones that are documented here are public facing, and intended to be used externally.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var utils = require('@colony/purser-core').utils; // utils.getRandomValues();
```

Using `ES6` `import` statements:
```js
import { utils } from '@colony/purser-core'; // utils.getRandomValues();
```

## Methods

### `bigNumber`

```js
bigNumber(Number | String  | bigNumber): bigNumber
```

This method is a wrapper around the `bn.js` library, so for the full API docs, see [this library's documentation](https://github.com/indutny/bn.js/blob/master/README.md).

This method will `return` an extended instance of `bn.js` _(already instantiated)_ that has a couple of extra methods added to it's prototype:

`toWei(): bigNumber`: Converts from `ETH` to `WEI` _(1 to the power of 18 multiplication)_. Returns the new value as a `bigNumber` instance.

`fromWei(): bigNumber`: Converts from `WEI` to `ETH` _(1 to the power of 18 division)_. Returns the new value as a `bigNumber` instance.

`toGwei(): bigNumber`: Converts from `ETH` to `GWEI` _(1 to the power of 9 multiplication)_. Returns the new value as a `bigNumber` instance.

`fromGwei(): bigNumber`: Converts from `GWEI` to `ETH` _(1 to the power of 9 division)_. Returns the new value as a `bigNumber` instance.

This method is used to work with number values throughout the library:
```js
import { open } from '@colony/purser-trezor';
import { bigNumber } from '@colony/purser-core/utils';

const gasPrice = bigNumber('0.00000001').toWei(); // { negative: 0, words: Array(4), length: 4, red: null }

const trezorWallet = await open(); // { address: "0x26eB...bAD1", type: "hardware", subtype: "trezor", ... }

const transactionSignature = await trezorWallet.sign({
  gasPrice,
  to: '0x3953...a4C1',
});
```

### `getRandomValues`

```js
getRandomValues(typedArray: Uint8Array<>)
```

A polyfill for the [`Web Crypto API`s](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) [`getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/RandomSource/getRandomValues) method.

It checks for both implementations _(`webkit` or `ms`)_, and if it can't find any, it will try to polyfill it using node's [`crypto`](https://nodejs.org/api/crypto.html) [`randomBytes`](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) method.

This method is used to provide randomness when creating a new wallet:
```js

import { create } from '@colony/purser-software';
import { getRandomValues } from '@colony/purser-core/utils';

// a bigger array is better, up to a max. of 65536 (the limit of the 8 bit unsigned array)

const uintArray = new Uint8Array(10); // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const entropy = getRandomValues(uintArray); // [236, 157, 149, 236, 109, 233, 113, 151, 27, 93]

const newWallet = await create({ entropy });
```

## Classes

### `PurserSigner`

```js
new PurserSigner(purserArgumentsObject: Object)
```

Create a new instance of an abstract signer, containing the follow required props: `provider`, `getAddress`, `signMessage`, `sendTransaction`.

[See more about the Ethers Abstract Signer](https://docs.ethers.io/ethers.js/html/api-wallet.html#signer-api), from which this inherits.

The constructor takes in a `purserArgumentsObject` Object _(See below)_, and returns a new instance of the signer.

The `purserArgumentsObject` must contain exactly one of each `purserWalletInstance` and `provider`, where `purserWalletInstance` is a instantiated wallet from any of the `purser` modules _(ie: `purser-software`)_, while `provider` is a provider instance object coming from a library like `ethers.js`.

**`purserArgumentsObject` format:**
```js
purserArgumentsObject {
  purserWalletInstance: PurserWalletInstace, // From any purser module
  provider: ProviderInstance, // ie: Ethers Provider Instance
};
```

**Instantiating Example:**
```js
import { providers } from 'ethers';
import { PurserSigner } from '@colony/purser-core';
import { create } from '@colony/purser-software';

const wallet = await create();
const provider = new providers.EtherscanProvider();

const signer = new PurserSigner({
  purserWalletInstance: wallet,
  provider,
});
```

#### `provider`

The `provider` property on the resulting signer instance is a direct reference of the provider you passed in when instantiating the class.

**Usage:**
```js
import { providers } from 'ethers';
import { PurserSigner } from '@colony/purser-core';
import { create } from '@colony/purser-software';

const wallet = await create();
const provider = new providers.EtherscanProvider();

const signer = new PurserSigner({
  purserWalletInstance: wallet,
  provider,
});

signer.provider; // EtherscanProvider { ... }
```

#### `getAddress(): Promise<string>`

The `getAddress` property on the resulting signer instance is a method that _returns_ the underlying wallet address from the purser wallet instance that yout passed in when instantiating the class.

This, as well as the other methods on the signer instance are async, so this will return the wallet address wrapped in a `Promise`.

**Usage:**
```js
import { providers } from 'ethers';
import { PurserSigner } from '@colony/purser-core';
import { create } from '@colony/purser-software';

const wallet = await create();
const provider = new providers.EtherscanProvider();

const signer = new PurserSigner({
  purserWalletInstance: wallet,
  provider,
});

await signer.getAddress(); // '0x0123...
```

#### `signMessage(message: string): Promise<string>`

The `signMessage` property on the resulting signer instance is a method that signs, then _returns_ the message signature.

This, as well as the other methods on the signer instance are async, so this will return the message signature wrapped in a `Promise`.

_**Note**: On some wallet types (ie: hardware) this method will require some form of confirmation from the user._

**Usage:**
```js
import { providers } from 'ethers';
import { PurserSigner } from '@colony/purser-core';
import { create } from '@colony/purser-software';

const wallet = await create();
const provider = new providers.EtherscanProvider();

const signer = new PurserSigner({
  purserWalletInstance: wallet,
  provider,
});

await signer.signMessage('Hello World'); // '0x0123...
```

#### `sendTransaction(transactionObject: Object): Promise<Object>`

The `sendTransaction` property on the resulting signer instance is a method that sends a transaction to the network.

The format of the transaction object format is detailed here: https://docs.ethers.io/ethers.js/html/api-providers.html#transaction-requests

This, as well as the other methods on the signer instance are async, so this will return the transaction response object wrapped in a `Promise`.

For the transaction response expected format see here: https://docs.ethers.io/ethers.js/html/api-providers.html#transaction-response

_**Note**: On some wallet types (ie: hardware) this method will require some form of confirmation from the user._

**Usage:**
```js
import { providers } from 'ethers';
import { PurserSigner } from '@colony/purser-core';
import { create } from '@colony/purser-software';

import { bigNumber } from '@colony/purser-core/utils';

const wallet = await create();
const provider = new providers.EtherscanProvider();

const signer = new PurserSigner({
  purserWalletInstance: wallet,
  provider,
});

await signer.sendTransaction({
  to: '0x3953...a4C1',
  nonce: 15987,
  gasLimit: bigNumber(30000),
  gasPrice: bigNumber('0.00000001').toWei(),
  chainId: 4,
  value: bigNumber(1).toWei(),
  data: '0x00',
}) // { hash: "0xf517...022e", }
```
