# API

These docs serve to outline the `API` format and methods provided by `colony-wallet`.

Unlike other wallet libraries, this one works entirely in `async` mode, meaning every `return` will be a `Promise` that must `resolve` _(or `reject`, if something goes wrong...)_.

#### Console output

In `development` mode there will be a number of warnings or errors outputted verbosely to the console.

When building with `NODE_ENV=production` all output will be silenced.

## Contents

* [Wallets](#wallets)
  * [Software](#software)
    * [`create`](#create)
    * [`open`](#open)
* [Providers](#providers)
  * [`metamask`](#metamask)
  * [`etherscan`](#etherscan)
  * [`infura`](#infura)
  * [`jsonRpc`](#jsonrpc)
  * [`autoselect`](#autoselect)
* [Utils](#Utils)
  * [`getRandomValues`](#getrandomvalues)


## Wallets

Create or open a new wallet via software, hardware or browser extension.

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

const provider = jsonRpc('http://localhost:8545', 'kovan');

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

## Providers

Create a connection to an Ethereum blockchain. This is achieved differently by the various providers.

HTTP API endpoint for _etherscan_ and _infura_, injected into the webpage in the case of _metamask_, or local RPC connection in the case of _jsonRpc_.

#### Imports:

There are different ways in which you can import the library in your project _(as a module)_, but in the end they all bring in the same thing:

Using `ES5` `require()` statements:
```js
var providers = require('colony-wallet/providers'); // providers.metamask();

var metamask = require('colony-wallet/providers').metamask; // metamask();
```

Using `ES6` `import` statements:
```js
import providers from 'colony-wallet/providers'; // providers.metamask();

import { metamask } from 'colony-wallet/providers'; // metamask();
```

### `metamask`

```js
metamask([network: string])
```

This provider method takes just an optional `network` name as string _(defaults to 'homestead')_ and will use the in-page `Web3` provider injected by the [Metamask extension](https://github.com/MetaMask/metamask-extension), if available.

```js
import { metamask } from 'colony-wallet/providers';

const provider = metamask('homestead'); // { chainId: '', ensAddress: '', ... }

// Or just use the defaults if you just want to go on mainnet.
const providerDefaults = metamask();
```

### `etherscan`

```js
etherscan([ProviderArguments: Object])
```

This method returns an provider instance object, instantiated with the necessary prop fields.

Even though it will work out of the box, it is highly recommended that you pass in at least the `apiKey` key via the `walletArguments` object. A new token for the Etherscan API can be generated [here](https://etherscan.io/myapikey).

See [`ProviderArgumentsType`](../src/flowtypes.js#L94-L98) in [`flowtypes.js`](../src/flowtypes.js) for how the arguments object looks like.

The only two _(optional)_ props that this method will take are `network` and `apiKey`.

```js
import { etherscan } from 'colony-wallet/providers';

const provider = etherscan({
  network: 'homestead',
  apiKey: '<your-token-key>',
});

// { chainId: '', ensAddress: '', ... }

```

### `infura`

```js
infura([ProviderArguments: Object])
```

This method returns an provider instance object, instantiated with the necessary prop fields.

Even though it will work out of the box, it is highly recommended that you pass in at least the `apiKey` key via the `walletArguments` object. A new token for the Infura API can be generated by [signing up for the service](https://infura.io/signup).

See [`ProviderArgumentsType`](../src/flowtypes.js#L94-L98) in [`flowtypes.js`](../src/flowtypes.js) for how the arguments object looks like.

The only two _(optional)_ props that this method will take are `network` and `apiKey`.

```js
import { infura } from 'colony-wallet/providers';

const provider = infura({
  network: 'homestead',
  apiKey: '<your-token-key>',
});

// { chainId: '', ensAddress: '', ... }
```

### `jsonRpc`

```js
jsonRpc([url: String], [network: String])
```

This provider method takes an optional `url` as string _(defaults to 'http://localhost:8545')_ and an optional `network` name as string _(defaults to 'homestead')_.

As opposed to the previous methods, this will just instantiate the provider but not actually connect to your local [`JSON-RPC`](http://www.jsonrpc.org/specification) server. It will only do that once you try sending a transaction. This also means that calling this method will never result in an error state, as any `url` string you provide will be initially instantiated -- when you try to communicate with it, than it will fail.

**Note:**

Most blockchain clients _(Parity, Geth)_ will restrict `JSON-RPC` connections by default via the `Access-Control-Allow-Origin` request header, or in the case of _Geth_, won't even start it by default.

To be able to connect to them locally you'll have to add `--rpccorsdomain "<your-domain>"` _(in the case of Parity)_ or `--jsonrpc-cors "<your-domain>"` _(in the case of Geth)_ to your startup command. You can also use `*` as the domain name for both of them _(allowing connections from all domains)_ but that is less secure.

```js
import { jsonRpc } from 'colony-wallet/providers';

const provider = jsonRpc('http://localhost:8545', 'homestead'); // { chainId: '', ensAddress: '', ... }
```

### `autoselect`

```js
autoselect([providersList: Array<function|Object>])
```

This is just a helper method that goes through a list of providers _(both generator methods and already instantiated provider objects)_ and selects the first one available.

By default it goes through the following provider list, in order: `[metamask, etherscan, infura, jsonRpc]`, so if this works for you, just call it directly without any arguments:

```js
import { autoselect } from 'colony-wallet/providers';

const provider = autoselect(); // This will return the first available, instantiated provider
```

Because it takes both generator methods and already-instantiated providers you can mix and match them:

```js
import { autoselect, metamask, jsonRpc } from 'colony-wallet/providers';

const localFallback = jsonRpc('http://localhost:8545', 'ropsten');

const provider = autoselect([() => metamask('ropsten'), localFallback]);
```

## Utils

A set of utility methods that are used throughout the library, but that are also exposed via the `utils` export for independent use.

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
