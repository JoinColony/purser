# Metamask Wallet API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

* Wallet
  * Metamask
    * [`open`](#open)
    * [`detect`](#detect)

### Metmask

A browser extension that provides a more secure interface to a software wallet. Available for [Chrome](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/) or [Opera](https://addons.opera.com/en/extensions/details/metamask/).

For a more in-depth look at what the resulting object looks like, see the [Wallet Object](wallet-object.md) docs.

#### Note: Transaction signing and implicit sending

Although this library focuses to be offline, this is not entirely true in the case of Metamask. This is because Metamask doesn't allow you to just sign a transaction. After signing, it will also broadcast it to the network.

Currently this cannot be overcome and you as a developer have to be aware of it.

There's an issue tracking the progress of this currently: [MetaMask/metamask-extension#3475](https://github.com/MetaMask/metamask-extension/issues/3475).

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var wallets = require('colony-wallet').wallets; // wallets.metamask.open().then();

var metamask = require('colony-wallet/metamask'); // trezor.open().then();

var open = require('colony-wallet/metamask').open; // open().then();
```

Using `ES6` `import` statements:
```js
import { wallets } from 'colony-wallet'; // await wallets.metamask.open();

import metamask from 'colony-wallet/metamask'; // await trezor.open();

import { open } from 'colony-wallet/metamask'; // await open();
```

### `open`

```js
await open(walletArguments: Object);
```

This method returns a `Promise` which, after resolving, it will `return` a new `MetamaskWallet` instance object. _(See: [Wallet Object](wallet-object.md) for details)_.

Unlike the other wallet types in this library, this static method does not take any arguments. It will use the selected address from Metamask.

_**Note:** If Metamask is not unlocked it cannot access the address, so an Error will be thrown._

**Usage examples:**

Open the metamask wallet:
```js
import { open } from 'colony-wallet/metamask';

const wallet = await open();
```

### `detect`

```js
await detect();
```

This is a helper method to detect if the Metamask injected `web3` proxy instance is available. It's not necessary for you to use since it's baked into the library, it's just exposed here for convenience.

This method returns a `Promise` which, after resolving, it will `return` only return `true`, if the Metamask instance is available and can be interacted with _(not locked)_. Otherwise it will `throw` an Error with the specific problem it encountered.

**Usage examples:**

Open the metamask wallet:
```js
import { detect as isMetamaskAvailable } from 'colony-wallet/metamask';

await isMetamaskAvailable();
```
