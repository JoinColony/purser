# Software Wallet API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

* Wallet
  * [Software](#software)
    * [`create`](#create)
    * [`open`](#open)


### Software

A standard wallet working in it's entirety in a software environment. This means that it gives you access to sensitive data _(`private key`, `mnemonic`, etc...)_ via it's API.

For a more in-depth look at what the resulting object looks like, see the [Wallet Object](wallet-object.md) docs.

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var wallet = require('colony-wallet/software'); // wallet.create().then();

var wallets = require('colony-wallet/wallets'); // wallets.software.create().then();

var wallet = require('colony-wallet/wallets').software; // wallet.create().then();

var create = require('colony-wallet/software').create; // create().then();
```

Using `ES6` `import` statements:
```js
import wallet from 'colony-wallet/software'; // await wallet.create();

import wallets from 'colony-wallet/wallets'; // await wallets.software.create();

import { software as wallet } from 'colony-wallet/wallets'; // await wallet.create();

import { create } from 'colony-wallet/software'; // await create();
```

### `create`

```js
await create([walletArguments: Object]);
```

This method returns a `Promise` which, upon resolving, will return new software wallet instance _(see: [Wallet Object](wallet-object.md))_.

By default it will generate the maximum possible `entropy` _(see: [`getRandomValues`](#getRandomValues))_ and will auto-select the first available provider _(see: [`autoselect`](#autoselect))_.

Even though it will work out of the box, you can however, pass in custom arguments via the `walletArguments` object.

See [`WalletArgumentsType`](../src/flowtypes.js#L34-L42) in [`flowtypes.js`](../src/flowtypes.js) for how the options object looks like.

```js
walletArguments.entropy: Uint8Array<>
```

Provide custom randomness when creating the wallet. By default it will use a `8`-bit unsigned array of `65536` length on which it will generate random values _(see: [`getRandomValues`](#getRandomValues))_.

```js
walletArguments.provider: Object | function
```

Override the default auto-selector _(see: [`autoselect`](#autoselect))_ and provide a manual, custom provider when creating the new wallet instance.

The provider `prop` can be either a provider object, or a provider generator method.

See [`ProviderType`](./src/flowtypes.js#L3-L16) and [`ProviderGeneratorType`](./src/flowtypes.js#L18) in [`flowtypes.js`](../src/flowtypes.js) for how the provider object and generator functions look like.

```js
walletArguments.password: String
```

Set an encryption password when creating the wallet. This way you can just call up the `keystore` getter and get the `JSON` string.

As with the others, this is optional, since it can be set after the wallet creation using the `keystore` setter.

**Usage examples:**

Create a new wallet:
```js
import { create } from 'colony-wallet/software';

const newWallet = await create();
```

Create a new wallet with manual entropy:
```js
import { create } from 'colony-wallet/software';
import { getRandomValues } from 'colony-wallet/utils';

const newWallet = await create({ entropy: getRandomValues(new Uint8Array(65536)) });
```

Create a new wallet and give it a provider:
```js
import { create } from 'colony-wallet/software';
import { jsonRpc } from 'colony-wallet/providers';

const provider = await jsonRpc('http://localhost:8545', 'kovan');

const newWallet = await create({ provider });
```

Create a new wallet and set the encryption password:
```js
import { create } from 'colony-wallet/software';

const newWallet = await create({ password: '0fbfd56c94dc9d2578a6' });

const newWalletKeystore = await newWallet.keystore;
```

See the [Wallet Object](wallet-object.md) documentation for all the props available to you after the wallet's instantiation.

### `open`

```js
await open(walletArguments: Object);
```

This method returns a `Promise`, which after unlocking it via one of the available methods, it will `resolve` and `return` new software wallet instance _(see: [Wallet Object](wallet-object.md))_.

By default it auto-selects the first available provider _(see: [`autoselect`](#autoselect))_, if one was not provided via the argument prop.

It will not work without any arguments so you must specify at least one method of opening the wallet. If at least one is not provided, the `Promise` will `reject`, throwing an error.

See [`WalletArgumentsType`](../src/flowtypes.js#L34-L42) in [`flowtypes.js`](../src/flowtypes.js) for how the options object looks like.

```js
walletArguments.privateKey: String
```

Create a new wallet instance using an existing `private key`. This can be optional if another method of opening the wallet is provided.

Using this method, the returned [Wallet Object](wallet-object.md) will have all of the props with exception of `mnemonic` and `path`, since the `mnemonic` can't be reversed from the `private key`.

```js
walletArguments.mnemonic: String
```

Create a new wallet instance using an existing `mnemonic` phrase. This can be optional if another method of opening the wallet is provided.

Using this method, the returned [Wallet Object](wallet-object.md) will have all of the props available. _(the `private key` can be reversed from the `mnemonic`)_

```js
walletArguments.path: String
```

Optional, in case you want to specify a custom `mnemonic` `path` when instantiating a wallet, you can do so by providing it via this prop.

This defaults to `m/44'/60'/0'/0/0`.

```js
walletArguments.provider: Object | function
```

Override the default auto-selector _(see: [`autoselect`](#autoselect))_ and provide a manual, custom provider when creating the wallet instance.

The provider `prop` can be either a provider object, or a provider generator method.

See [`ProviderType`](./src/flowtypes.js#L3-L16) and [`ProviderGeneratorType`](./src/flowtypes.js#L18) in [`flowtypes.js`](../src/flowtypes.js) for how the provider object and generator functions look like.

```js
walletArguments.keystore: String
```

Open a new wallet instance using an encrypted `keystore`. For this to work, the `password` argument prop must also be set.

Using this method, the returned Wallet Object will have all of the props available.

See the [Wallet Object](wallet-object.md#keystore) for more information on this.

```js
walletArguments.password: String
```

Set an encryption password when instantiating the wallet. This way you can just call up the `keystore` getter and get the `JSON` string.

This can be set after the wallet creation using the `keystore` setter, but must be included if the wallet is to be instantiated using an encrypted `keystore`.

**Usage examples:**

Open a wallet using a private key:
```js
import { open } from 'colony-wallet/software';

const privateKey = '0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447';

const existingWallet = await open({ privateKey });
```

Open a wallet using a mnemonic phrase:
```js
import { open } from 'colony-wallet/software';

const mnemonic = 'load blush spray dirt random cash pear illness pulse sketch sheriff surge';

const existingWallet = await open({ mnemonic });
```

Open a new wallet, and give it a provider and encryption password:
```js
import { open } from 'colony-wallet/software';
import { etherscan } from 'colony-wallet/providers';

const existingWallet = await open({
  privateKey: '0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447'
  provider: etherscan,
  password: '6a8752d9cd49c65dfbf0',
});
```

Open a new wallet using an encrypted keystore:
```js
import { open } from 'colony-wallet/software';

const keystore = '{"address":"3953cf4ea75a62c6fcd0b3988b1984265006a4cc","id":"55df8726-b08d-41ce-b9a0-8cb7d4cb7254","version":3,"Crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"919afe213cbac6704362f8139a0a3519"},"ciphertext":"d823708436d306b7bc8caf2f8bedf93e86f28c1edbb2bc89bae8e9ad78971682","kdf":"scrypt","kdfparams":{"salt":"0be48e9efbeb26be2e7f68cfc61d1e83c34dd9406cfec3c77e71e637dd01a51b","n":131072,"dklen":32,"p":1,"r":8},"mac":"c9b6cd3173daf1ea6633b2d2848ab96765340bb27a07a203ecf17454c568cc3e"}}';

const existingWallet = await open({
  keystore,
  password: '6a8752d9cd49c65dfbf0',
});
```

See the [Wallet Object](wallet-object.md) documentation for all the props available to you after the wallet's instantiation.
