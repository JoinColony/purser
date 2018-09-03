# Trezor Wallet API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

* Hardware
  * Trezor
    * [`open`](#open)

### Hardware

A hardware device that gives you access to it's internal stored account(s). Usually enforced by a hardware true random number generator.

For a more in-depth look at what the resulting object looks like, see the [Wallet Object](wallet-object.md) docs.

#### Note: Trezor Bridge

To be able to use the Trezor Wallet inside a browser, you'll need to install and start a [Trezor Bridge Service](https://wallet.trezor.io/#/bridge), otherwise the hardware device won't be able to talk to the browser.

_If the above link doesn't work, here's an [alternative download location](https://wallet.trezor.io/data/bridge/latest/index.html)_

#### Note: Firmware Version

The Trezor Wallet only started supporting ethereum methods in firmware version `1.4.0`, so make sure your device has this version at least. _(But most likely it will have a newer version)_. A safe bet is to update it to the latest one.

Just make sure that, if you're updating your firmware version, it will wipe all your device's memory and you'll have to restore it from a saved seed.

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var wallets = require('colony-wallet').wallets; // wallets.trezor.open().then();

var trezor = require('colony-wallet/trezor'); // trezor.open().then();

var open = require('colony-wallet/trezor').open; // open().then();
```

Using `ES6` `import` statements:
```js
import { wallets } from 'colony-wallet'; // await wallets.trezor.open();

import trezor from 'colony-wallet/trezor'; // await trezor.open();

import { open } from 'colony-wallet/trezor'; // await open();
```

### `open`

```js
await open(walletArguments: Object);
```

This method returns a `Promise` which, after confirming the _Ethereum Account Export_ via the window prompt _(and optionally entering your PIN)_, it will `resolve` and `return` a new `TrezorWallet` instance object. _(See: [Wallet Object](wallet-object.md) for details)_.

By default it auto-selects the first available provider _(see: [`autoselect`](api-providers.md#autoselect))_, if one was not provided via the argument prop.

**_Providers are deprecated and will no longer be supported, so make sure you don't rely on them too much)_**

By default, without any arguments it will open the first `10` accounts in the derivation path, but you can change that via the `addressCount` object prop argument _(Unlike the software wallet, this is the only argument the `open` method takes, but to preserved consistency, it's still being passed in as an object)_.

Also, the first index from the addresses that you opened will be selected as the default one _(See: the `setDefaultAddress()` method from the [Wallet Object](wallet-object.md))_, while the rest of them will be available under the `otherAddresses` Array prop on the wallet instance.

#### Argument props

```js
walletArguments.addressCount: Number = 10
```

Sets the number of addresses to derive from the derivation path. Defaults to `10` and cannot be set lower than `1`.

It will set first one as the default _(index `0`)_, while the rest will be available through the `otherAddresses` Array, found as a prop on the Wallet Instance _(index `0` through `9` in this case)_.

You will be able to change them using the `setDefaultAddress()` instance method _(See: [Wallet Object](wallet-object.md) for details))_.

```js
walletArguments.chainId: Number = 1
```

Sets the `id` of the network _(eg: `homestead`, `ropsten`, etc...)_ you want your account to be opened under _(changes the `derivationPath` of the opened addresses)_.

It will also be used if you don't provide one when trying to sign a transaction.

Defaults to `id` `1`: `homestead`.

**Usage examples:**

Open the trezor wallet using the default number of addresses:
```js
import { open } from 'colony-wallet/trezor';

const wallet = await open();
```

Open the trezor wallet using a custom number of addresses:
```js
import { open } from 'colony-wallet/trezor';

const wallet = await open({ addressCount: 100 });

// Optionally set another address as the default

await wallet.setDefaultAddress(12); //true
```

Open the trezor wallet using a different chain id
```js
import { open } from 'colony-wallet/trezor';

const wallet = await open({ chainId: 3 }); // ropsten

await wallet.derivationPath; // m/44'/1'/0'/0/0
```
