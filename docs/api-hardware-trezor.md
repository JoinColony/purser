# API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

* [Wallets](#wallets)
  * [Hardware](#hardware)
    * [Trezor](#trezor)
      * [`open`](#open-trezor)


## Wallets

Open a new wallet via a hardware device.

### Hardware

A hardware device that gives you access to it's internal stored account(s). Usually enforced by a hardware true random number generator.

For a more in-depth look at what the resulting object looks like, see the [Wallet Object](wallet-object.md) docs.

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var wallet = require('colony-wallet/hardware'); // wallet.trezor.open().then();

var wallets = require('colony-wallet/wallets'); // wallets.hardware.trezor.open().then();

var wallet = require('colony-wallet/wallets').hardware; // wallet.trezor.open().then();

var trezor = require('colony-wallet/hardware/trezor'); // trezor.open().then();
```

Using `ES6` `import` statements:
```js
import wallet from 'colony-wallet/hardware'; // await wallet.trezor.open();

import wallets from 'colony-wallet/wallets'; // await wallets.hardware.trezor.open();

import { hardware as wallet } from 'colony-wallet/wallets'; // await wallet.trezor.open();

import { trezor } from 'colony-wallet/hardware'; // await trezor.open();
```

### `open`

```js
await open(walletArguments: Object);
```
...
