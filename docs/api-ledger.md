# Ledger Wallet API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

* Hardware
  * Ledger
    * [`open`](#open)


### Hardware

A hardware device that gives you access to it's internal stored account(s). Usually enforced by a hardware true random number generator.

For a more in-depth look at what the resulting object looks like, see the [Wallet Object](wallet-object.md) docs.

#### Note: `udev` rules

On unix systems the Ledger Wallet will need `udev` rules manually set, since the kernel doesn't recognize HID devices by default.

See the [Fix connection issues](https://support.ledgerwallet.com/hc/en-us/articles/115005165269-Fix-connection-issues) Ledger support issue, for how to set them.

#### Note: Auto-locking

By default, the Ledger device will auto-lock after 10 minutes. _(It will show a screen-saver)_. When this happens the browser will no longer be able to communicate with it and it will act like it's disconnected.

Only after re-entering your PIN and unlocking it, it will resume normal operation.

#### Note: Mozilla Firefox U2F

Due to the current state of U2F implementation in Mozilla Firefox, the Ledger Device's Ethereum Wallet will not be able to function, since it relies on features not implemented yet.

On the bright side, the FIDO web authentication app will still work as the features required for that *are* implemented.

_Just make sure you enable U2F functionality, by setting `security.webauth.u2f` to `true`, from the `about:config` page_

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var wallets = require('colony-wallet').wallets; // wallets.ledger.open().then();

var ledger = require('colony-wallet/ledger'); // ledger.open().then();

var open = require('colony-wallet/ledger').open; // open().then();
```

Using `ES6` `import` statements:
```js
import { wallets } from 'colony-wallet'; // await wallets.ledger.open();

import ledger from 'colony-wallet/ledger'; // await ledger.open();

import { open } from 'colony-wallet/ledger'; // await open();
```

### `open`

```js
await open(walletArguments: Object);
```

This method returns a `Promise` which, after resolving, it will `return` a new `LedgerWallet` instance object. _(See: [Wallet Object](wallet-object.md) for details)_.

Without any arguments it will open the first `10` accounts in the derivation path, but you can change that via the `addressCount` object prop argument _(Unlike the software wallet, this is the only argument the `open` method takes, but to preserved consistency, it's still being passed in as an object)_.

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

Open the ledger wallet using the default number of addresses:
```js
import { open } from 'colony-wallet/ledger';

const wallet = await open();
```

Open the ledger wallet using a custom number of addresses:
```js
import { open } from 'colony-wallet/ledger';

const wallet = await open({ addressCount: 100 });

// Optionally set another address as the default

await wallet.setDefaultAddress(12); //true
```

Open the ledger wallet using a different chain id
```js
import { open } from 'colony-wallet/ledger';

const wallet = await open({ chainId: 3 }); // ropsten

await wallet.derivationPath; // m/44'/1'/0'/0/0
```
