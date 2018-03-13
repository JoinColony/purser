# Wallet Object

This document describes the format you can expect the `SoftwareWallet` instance object to look like.

Instantiating a new wallet:
```js
import { software as wallet } from 'colony-wallet/wallets';

wallet.create();
```
Gives you the following object:
```js
SoftwareWallet {
  address: String,
  addressQR: Promise<String>,
  blockie: Promise<String>,
  defaultGasLimit: Number,
  keystore: Promise<String | undefined>,
  mnemonic: String | undefined,
  path: String,
  privateKey: String,
  privateKeyQR: Promise<String>,
  provider: Object | Function | undefined,
}
```

This is the complete form of the Wallet Object, but in some cases, values are going to be set to undefined due to various constraints.

_**Example:** Instantiating a wallet using an existing `private key` will set the `mnemonic` to `undefined` since it's value cannot be reversed. But instantiating a wallet using a `mnemonic` phrase will also set the `privateKey`s prop value since that can be reversed._

## Contents:

* [SoftwareWallet](#wallet-object)
  * [`address`](#address)
  * [`addressQR`](#addressqr)
  * [`blockie`](#blockie)
  * [`defaultGasLimit`](#defaultgaslimit)
  * [`keystore`](#keystore)
  * [`mnemonic`](#mnemonic)
  * [`path`](#path)
  * [`privateKey`](#privatekey)
  * [`privateKeyQR`](#privatekeyqr)
  * [`provider`](#provider)

### `address`
```js
SoftwareWallet.address: String
```

Contains the wallet's public address in the form of `String`.

_**Tip:** Across all wallet types and formats this is the only value that you can count on as always present on the object._

```js
import { open } from 'colony-wallet/software';

const wallet = open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

console.log(wallet.address); // 0x3953cF4eA75a62c6fCD0b3988b1984265006a4CC
```

### `addressQR`
```js
SoftwareWallet.addressQR: Promise<String>
```

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns a QR code of the wallet's public address in the form of a `base64`-encoded `String`.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

The returned image has a size of `200`x`200` pixels.

```js
import { open } from 'colony-wallet/software';

const wallet = open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

const qr = await wallet.addressQR;

console.log(qr); // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAA ... eocAAAAAASUVORK5CYII=
```

### `blockie`
```js
SoftwareWallet.blockie: Promise<String>
```

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns a [Blockie _(Identicon)_](https://github.com/rdig/better-ethereum-blockies) of the wallet's public address in the form of a `base64`-encoded `String`.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

The returned image has a size of `200`x`200` pixels.

```js
import { open } from 'colony-wallet/software';

const wallet = open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

const blockie = await wallet.blockie;

console.log(qr); // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAA ... Dw2G0AAAAAElFTkSuQmCC
```

### `defaultGasLimit`
```js
SoftwareWallet.defaultGasLimit: Number
```

This is prop has both a `getter` and a `setter` attached to it. The `getter` returns a `Number` value, while the `setter` sets a new one.

This value will be used if the transaction you wish to send from the wallet does not contain a `gasLimit`.

```js
import { open } from 'colony-wallet/software';

const wallet = open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

console.log(wallet.defaultGasLimit); // 1500000

wallet.defaultGasLimit = 1600000;

console.log(wallet.defaultGasLimit); // 1600000
```

### `keystore`
```js
SoftwareWallet.keystore: Promise<String | undefined>
```

This is prop has both a `getter` and a `setter` attached to it. The `getter` is `async` and returns a `Promise`, while the `setter` is synchronous and give you the ability to set the encryption password.

The `getter` `Promise` won't resolve if an encryption password wasn't set, either via the `password` argument when instantiating the wallet or via the aforementioned `setter`.

Upon resolving, the `Promise` will return a `JSON`-formatted `String`. _(Which you can transform into an object using `JSON.parse()`)_.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

If you need more information about the encrypted `keystore`, you can check out the [Web3 Secret Storage Definition](https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition).

```js
import { open } from 'colony-wallet/software';

const wallet = open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

let keystore = await wallet.keystore; // Promise rejects: You did not provide a password for encryption...

console.log(keystore); // undefined

wallet.keystore = '0fbfd56c94dc9d2578a6';

let keystore = await wallet.keystore;

console.log(keystore); // {"address":"3953cf4ea75a62c6fcd0b3988b1984265006a4 ... 8f53696a","version":"0.1"}}
```

### `mnemonic`
```js
SoftwareWallet.mnemonic: String | undefined
```

If a _new_ wallet was instantiated, or a new instance was created via a `mnemonic` phrase, this prop will contain that _(or a new)_ phrase in the form of a `String`.

```js
import { create } from 'colony-wallet/software';

const wallet = create();

console.log(wallet.mnemonic); // load blush spray dirt random cash pear illness pulse sketch sheriff surge
```

### `path`
```js
SoftwareWallet.path: String
```

Contains the [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) [derivation path](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#specification-key-derivation) in the form of a `String`. When instantiating a wallet using a `mnemonic` phrase, this is used to re-create the `private key`.

This defaults to `m/44'/60'/0'/0/0`, but can be manually set when creating the wallet instance.

```js
import { open } from 'colony-wallet/software';

const wallet = open({ mnemonic: 'load blush spray dirt random cash pear illness pulse sketch sheriff surge' });

console.log(wallet.path); // m/44'/60'/0'/0/0
```

### `privateKey`
```js
SoftwareWallet.privateKey: String
```

Contains the `private key` for the wallet in `String` form. This will be available in all cases: if you created a new wallet instance, if you opened a wallet instance using either a `mnemonic` or a `private key`.

_**Warning:** As the name suggests, this is private. So treat it with caution and if possible don't expose it to other parts of your app._

```js
import { open } from 'colony-wallet/software';

const wallet = open({ mnemonic: 'load blush spray dirt random cash pear illness pulse sketch sheriff surge' });

console.log(wallet.privateKey); // 0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447
```

### `privateKeyQR`
```js
SoftwareWallet.privateKeyQR: Promise<String>
```

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns a QR code of the wallet's `private key` address in the form of a `base64`-encoded `String`.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

The returned image has a size of `200`x`200` pixels.

```js
import { open } from 'colony-wallet/software';

const wallet = open({ privateKey: `0x92745ab44bb19f1e955db11ef7c22f830524691d0be3630fa6c4d89120c9f447` });

const qr = await wallet.privateKeyQR;

console.log(qr); // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAA ... 5rQkAAAAASUVORK5CYII=
```

### `provider`
```js
SoftwareWallet.provider: Object | Function | undefined
```

This is an optional prop that will contain a [provider](api.md#providers) for the wallet to use. It can be set during instantiation _(both `open()` and `create()`)_ and can even be set to `null` or `undefined` if you don't want to have one.

As a value, it can be both a [provider `Object`](../flowtypes.js#L3-L16) or a [provider generator method](api.md#providers).

If one is not set via the argument prop, it defaults to [`autoselect()`](api.md#autoselect), setting the first one available.

```js
import { create } from 'colony-wallet/software';
import { localhost } from 'colony-wallet/providers';

const wallet = create({ provider: localhost });

console.log(wallet.provider); // {chainId: 1, ensAddress: "0x314159265dD8dbb310642f98f50C066173C1259b", name: "homestead", _events: {…}, resetEventsBlock: ƒ, …}
```
