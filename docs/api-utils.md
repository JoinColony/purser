# Utils API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

There are a number of other `util` methods that are available inside this library, but these are the only ones that are public facing, and that are intended to be used externally from the library's own methods.

* Utils
  * [`bigNumber`](#bignumber)
  * [`getRandomValues`](#getrandomvalues)

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var utils = require('colony-wallet').utils; // utils.getRandomValues();
```

Using `ES6` `import` statements:
```js
import { utils } from 'colony-wallet'; // utils.getRandomValues();
```

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
import { open } from 'colony-wallet/trezor';
import { utils } from 'colony-wallet';

const { bigNumber } = utils;

const gasPrice = bigNumber('0.00000001').toWei(); // {negative: 0, words: Array(4), length: 4, red: null}

const trezorWallet = await open(); // {address: "0x26eB...bAD1", type: "hardware", subtype: "trezor", ...}

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

import wallet from 'colony-wallet/software';
import { utils } from 'colony-wallet';

const { getRandomValues } = utils;

// a bigger array is better, up to a max. of 65536 (the limit of the 8 bit unsigned array)

const uintArray = new Uint8Array(10); // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const entropy = getRandomValues(uintArray); // [236, 157, 149, 236, 109, 233, 113, 151, 27, 93]

const newWallet = await wallet.create({ entropy });
```
