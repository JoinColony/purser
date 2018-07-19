# Wallet Object

This document describes the format you can expect the `Wallet` instance object to look like.

```js
WalletInstance {
  /*
   * Props
   */
  address: String,
  addressQR: Promise<String>, // deprecated
  blockie: Promise<String>, // deprecated
  defaultGasLimit: Number,
  keystore: Promise<String>,
  mnemonic: String,
  path?: String, // deprecated, will be renamed to `derivationPath`
  derivationPath?: Promise<String>,
  privateKey: String,
  privateKeyQR: Promise<String>, // deprecated
  publicKey: Promise<String>,
  provider: Object, // deprecated
  type: String,
  subtype: String,
  /*
   * Methods
   */
  sendWithConfirmation(transactionObject: Object, confirmation: Promise<boolean> | boolean): Promise<string>,
}
```

This is the complete form of the Wallet Object, but in some cases, values are not going to be set due to various constraints.

_**Example:** Instantiating a software wallet using an existing `privateKey` will not set the `mnemonic` since it's value cannot be reversed. But instantiating a software wallet using a `mnemonic` phrase will also set the `privateKey`s prop value since that can be reversed._

## Contents:

* Wallet Object Instance
  * Props
    * [`address`](#address)
    * [`addressQR`](#addressqr)
    * [`blockie`](#blockie)
    * [`defaultGasLimit`](#defaultgaslimit)
    * [`keystore`](#keystore)
    * [`mnemonic`](#mnemonic)
    * [`path`](#path)
    * [`derivationPath`](#derivationpath)
    * [`privateKey`](#privatekey)
    * [`privateKeyQR`](#privatekeyqr)
    * [`publicKey`](#publickey)
    * [`provider`](#provider)
    * [`type`](#type)
    * [`subtype`](#subtype)
  * Methods
    * [`sendWithConfirmation()`](#sendwithconfirmation)

## Props

### `address`
```js
WalletInstance.address: String
```

Contains the wallet's public address in the form of `String`.

_**Tip:** Across all wallet types and formats this is the only value that you can count on as always present on the object._

```js
import { open } from 'colony-wallet/software';

const wallet = await open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

console.log(wallet.address); // 0x3953cF4eA75a62c6fCD0b3988b1984265006a4CC
```

### `addressQR`
```js
WalletInstance.addressQR: Promise<String>
```

**_The `addressQR` prop is deprecated and will no longer be supported (and at some point removed), so make sure you don't rely on it too much_**

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns a QR code of the wallet's public address in the form of a `base64`-encoded `String`.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

The returned image has a size of `200`x`200` pixels.

```js
import { open } from 'colony-wallet/software';

const wallet = await open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

const qr = await wallet.addressQR;

console.log(qr); // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAA ... eocAAAAAASUVORK5CYII=
```

### `blockie`
```js
WalletInstance.blockie: Promise<String>
```

**_The `blockie` prop is deprecated and will no longer be supported (and at some point removed), so make sure you don't rely on it too much_**

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns a [Blockie _(Identicon)_](https://github.com/rdig/better-ethereum-blockies) of the wallet's public address in the form of a `base64`-encoded `String`.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

The returned image has a size of `200`x`200` pixels.

```js
import { open } from 'colony-wallet/software';

const wallet = await open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

const blockie = await wallet.blockie;

console.log(qr); // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAA ... Dw2G0AAAAAElFTkSuQmCC
```

### `defaultGasLimit`
```js
WalletInstance.defaultGasLimit: Number
```

This is prop has both a `getter` and a `setter` attached to it. The `getter` returns a `Number` value, while the `setter` sets a new one.

This value will be used if the transaction you wish to send from the wallet does not contain a `gasLimit`.

```js
import { open } from 'colony-wallet/software';

const wallet = await open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

console.log(wallet.defaultGasLimit); // 1500000

wallet.defaultGasLimit = 1600000;

console.log(wallet.defaultGasLimit); // 1600000
```

### `keystore`
```js
WalletInstance.keystore: Promise<String | undefined>
```

This is prop has both a `getter` and a `setter` attached to it. The `getter` is `async` and returns a `Promise`, while the `setter` is synchronous and give you the ability to set the encryption password.

The `getter` `Promise` won't resolve if an encryption password wasn't set, either via the `password` argument when instantiating the wallet or via the aforementioned `setter`.

Upon resolving, the `Promise` will return a `JSON`-formatted `String`. _(Which you can transform into an object using `JSON.parse()`)_.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

If the wallet was instantiated using an encrypted `keystore`, than this value is already set and memoized, so calling this will return the value instantly,

If you need more information about the encrypted `keystore`, you can check out the [Web3 Secret Storage Definition](https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition).

```js
import { open } from 'colony-wallet/software';

const wallet = await open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

let keystore = await wallet.keystore; // Promise rejects: You did not provide a password for encryption...

console.log(keystore); // undefined

wallet.keystore = '0fbfd56c94dc9d2578a6';

let keystore = await wallet.keystore;

console.log(keystore); // {"address":"3953cf4ea75a62c6fcd0b3988b1984265006a4 ... 8f53696a","version":"0.1"}}
```

### `mnemonic`
```js
WalletInstance.mnemonic: String | undefined
```

If a _new_ wallet was instantiated, or a new instance was created via a `mnemonic` phrase, this prop will contain that _(or a new)_ phrase in the form of a `String`.

```js
import { create } from 'colony-wallet/software';

const wallet = await create();

console.log(wallet.mnemonic); // load blush spray dirt random cash pear illness pulse sketch sheriff surge
```

### `path`
```js
WalletInstance.path: String
```

**_The `path` prop is deprecated and will be renamed to `derivationPath`, so make sure you don't rely on it too much_**

See: [`derivationPath`](#derivationpath)

### `derivationPath`
```js
WalletInstance.derivationPath: Promise<String>
```

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns a [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) [derivation path](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#specification-key-derivation) in the form of a `String`.

When instantiating a software wallet using a `mnemonic` phrase, this is used to re-create the `privateKey`. This defaults to `m/44'/60'/0'/0/0`, but can be manually set when creating the wallet instance.

On a hardware wallet, this is read-only, and is used to derive all the address indexes.

```js
import { open } from 'colony-wallet/software';

const wallet = await open({ mnemonic: 'load blush spray dirt random cash pear illness pulse sketch sheriff surge' });

console.log(await wallet.derivationPath); // m/44'/60'/0'/0/0
```
```js
import { open } from 'colony-wallet/hardware/trezor';

const wallet = await open();

console.log(await wallet.derivationPath); // m/44'/60'/0'/0/0

walet.setDefaultAddress(1);

console.log(await wallet.derivationPath); // m/44'/60'/0'/0/1
```

### `privateKey`
```js
WalletInstance.privateKey: String
```

Contains the `private key` for the wallet in `String` form. This will be available in all cases: if you created a new wallet instance, if you opened a wallet instance using either a `mnemonic` or a `private key`.

_**Warning:** As the name suggests, this is private. So treat it with caution and if possible don't expose it to other parts of your app._

```js
import { open } from 'colony-wallet/software';

const wallet = await open({ mnemonic: 'load blush spray dirt random cash pear illness pulse sketch sheriff surge' });

console.log(wallet.privateKey); // 0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447
```

### `privateKeyQR`
```js
WalletInstance.privateKeyQR: Promise<String>
```

**_The `privateKeyQR` prop is deprecated and will no longer be supported (and at some point removed), so make sure you don't rely on it too much_**

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns a QR code of the wallet's `private key` address in the form of a `base64`-encoded `String`.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

The returned image has a size of `200`x`200` pixels.

```js
import { open } from 'colony-wallet/software';

const wallet = await open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

const qr = await wallet.privateKeyQR;

console.log(qr); // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAA ... 5rQkAAAAASUVORK5CYII=
```

### `publicKey`
```js
WalletInstance.publicKey: Promise<String>
```

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns the public key for the current address, in `String` form.

This is useful for cases where you want to prove the wallet's identity without exposing any private and dangerous information _(eg: `privateKey`, `mnemonic`...)_.

```js
import { open } from 'colony-wallet/hardware/trezor';

const wallet = await open();

console.log(await wallet.publicKey); // 0x93f7 ... a9dd
```

### `provider`
```js
WalletInstance.provider: Object | Function | undefined
```

**_Providers are deprecated and will no longer be supported, so make sure you don't rely on them too much_**

This is an optional prop that will contain a [provider](api-providers.md) for the wallet to use. It can be set during instantiation _(both `open()` and `create()`)_ and can even be set to `null` or `undefined` if you don't want to have one.

As a value, it can be both a [provider `Object`](../src/flowtypes.js#L3-L16) or a [provider generator method](api-proviers.md).

If one is not set via the argument prop, it defaults to [`autoselect()`](api-providers.md#autoselect), setting the first one available.

```js
import { create } from 'colony-wallet/software';
import { jsonRpc } from 'colony-wallet/providers';

const wallet = await create({ provider: jsonRpc });

console.log(wallet.provider); // {chainId: 1, ensAddress: "0x314159265dD8dbb310642f98f50C066173C1259b", name: "homestead", _events: {…}, resetEventsBlock: ƒ, …}
```

### `type`
```js
WalletInstance.type: String
```

This is just a simple string value that represents the main type for the instantiated wallet object.

```js
import { create } from 'colony-wallet/software';

const wallet = await create();

console.log(wallet.type); // software
```

### `subtype`
```js
WalletInstance.subtype: String
```

This is just a simple string value that represents the sub type for _(wallet type engine)_ the instantiated wallet object.

```js
import { create } from 'colony-wallet/software';

const wallet = await create();

console.log(wallet.subtype); // ethers
```

## Methods

### `sendWithConfirmation()`
```js
WalletInstance.sendWithConfirmation(transactionObject: Object, confirmation: Promise<boolean> | boolean): Promise<string>
```

**_The `sendWithConfirmation` method is deprecated as a result of [Providers](api-providers.md) being deprecated, so make sure you don't rely on it too much. This functionality will be offloaded to the user._**

This is a wrapper for the `sendTransaction()` method that adds an extra argument which controls an async transaction confirmation. This is useful for scenarios where you would want to ask a user for approval / acknowledgement before sending a transaction to be mined.

As with `sendTransaction()` it takes a `transactionObject` object as the first argument, and a `confirmation` as the second one. The `confirmation` must either be a `boolean` type or an method _(sync or async)_ that itself returns a `boolean`. _(Eg: a `Promise`)_.

If the `confirmation` is truthy _(and the `transaction` object format is valid)_ it will return a `Promise`, which will resolve to the transaction hash as a `string` type. If the `confirmation` fails _(is `false`)_, it will return a `reject`ed `Promise`, and, if we're running in `dev` mode, it will log out a warning to the console.

```js
import { create } from 'colony-wallet/software';

const wallet = await create();

const transaction = {
  to: '0x3953cF4eA75a62c6fCD0b39abc1984265006a4CC',
  inputData: '0x0',
};

await wallet.sendWithConfirmation(
  transaction,
  window.confirm('Do you want to send this transaction?'),
);

```
