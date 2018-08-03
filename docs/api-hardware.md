# Hardware Wallet API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

* Wallets
  * [Hardware](#hardware)
    * [Trezor](#trezor)
    * [Ledger](#ledger)

### Hardware

A hardware device that gives you access to it's internal stored account(s). Usually enforced by a hardware true random number generator.

For a more in-depth look at what the resulting object looks like, see the [Wallet Object](wallet-object.md) docs.

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var wallets = require('colony-wallet').wallets;

var trezor = require('colony-wallet/trezor');

var ledger = require('colony-wallet/ledger');

```

Using `ES6` `import` statements:
```js
import { wallets } from 'colony-wallet';

import trezor from 'colony-wallet/trezor';

import ledger from 'colony-wallet/ledger';

```

#### Trezor

See the [Trezor Wallet API](api-trezor.md).

#### Ledger

See the [Ledger Wallet API](api-ledger.md).
