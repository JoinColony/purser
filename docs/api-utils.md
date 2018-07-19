# Utils API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

* Utils
  * [`getRandomValues`](#getrandomvalues)


#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var utils = require('colony-wallet/utils'); // utils.getRandomValues();

var getRandomValues = require('colony-wallet/utils').getRandomValues; // getRandomValues();
```

Using `ES6` `import` statements:
```js
import utils from 'colony-wallet/utils'; // utils.getRandomValues();

import { getRandomValues } from 'colony-wallet/utils'; // getRandomValues();
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
import { getRandomValues } from 'colony-wallet/utils';

// a bigger array is better, up to a max. of 65536 (the limit of the 8 bit unsigned array)

const uintArray = new Uint8Array(10); // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const entropy = getRandomValues(uintArray); // [236, 157, 149, 236, 109, 233, 113, 151, 27, 93]

const newWallet = wallet.create({ entropy });
```
