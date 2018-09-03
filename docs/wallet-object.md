# Wallet Object

This document describes the format you can expect the `Wallet` instance object to look like.

```js
WalletInstance {
  /*
   * Props
   */
  address: String,
  chainId: Number,
  keystore: Promise<String>,
  mnemonic: String,
  derivationPath?: Promise<String>,
  otherAddresses: Array<String>,
  privateKey: String,
  publicKey: Promise<String>,
  type: String,
  subtype: String,
  /*
   * Methods
   */
  setDefaultAddress(addressIndex: Number): Promise<Boolean>,
  sign(transactionObject: Object): Promise<String>
  signMessage(messageObject: Object): Promise<String>
  verifyMessage(verificationObject: Object): Promise<Boolean>
}
```

This is the complete form of the Wallet Object, but in some cases, values are not going to be set due to various constraints.

_**Example:** Instantiating a software wallet using an existing `privateKey` will not set the `mnemonic` since it's value cannot be reversed. But instantiating a software wallet using a `mnemonic` phrase will also set the `privateKey`s prop value since that can be reversed._

## Contents:

* Wallet Object Instance
  * Props
    * [`address`](#address)
    * [`chainId`](#chainid)
    * [`keystore`](#keystore)
    * [`mnemonic`](#mnemonic)
    * [`derivationPath`](#derivationpath)
    * [`otherAddresses`](#otheraddresses)
    * [`privateKey`](#privatekey)
    * [`publicKey`](#publickey)
    * [`type`](#type)
    * [`subtype`](#subtype)
  * Methods
    * [`setDefaultAddress()`](#setdefaultaddress)
    * [`sign()`](#sign)
    * [`signMessage()`](#signmessage)
    * [`verifyMessage()`](#verifymessage)

## Props

### `address`
```js
WalletInstance.address: String
```

Contains the wallet's public address in the form of `String`.

_**Tip:** Across all wallet types and formats this is the only value that you can count on as always present on the object._

_**Note:** For the [Metamask Wallet](api-metamask.md) this will always reflect the address selected from the UI, so you can always count on it to be accurate._

**Usage:**
```js
import { open } from 'colony-wallet/software';

const wallet = await open({ privateKey: `0x9274...f447` });

console.log(wallet.address); // 0x3953...a4CC
```

### `chainId`
```js
WalletInstance.chainId: Number
```

Contains the `id` of the network the wallet is intended to work on _(eg: `homestead`, `ropsten`, etc)_.

This is used on the hardware wallets to determine the `derivationPath` and on _all_ wallet types as a default if one isn't provided to the object of transaction you wish to [sign](#sign).

_**Note:** For the [Metamask Wallet](api-metamask.md) this is not available as it handles it internally, but can be changed using the UI._

**Usage:**
```js
import { open } from 'colony-wallet/ledger';

const wallet = await open({ chainId: 3 });

console.log(wallet.chainId); // 3
```

### `keystore`
```js
WalletInstance.keystore: Promise<String>
```

This is prop has both a `getter` and a `setter` attached to it. The `getter` is `async` and returns a `Promise`, while the `setter` is synchronous and give you the ability to set the encryption password.

The `getter` `Promise` won't resolve if an encryption password wasn't set, either via the `password` argument when instantiating the wallet or via the aforementioned `setter`.

Upon resolving, the `Promise` will return a `JSON`-formatted `String`. _(Which you can transform into an object using `JSON.parse()`)_.

This `getter` is also [memoized](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#Smart_self-overwriting_lazy_getters), so the next time you read it's value, it will be served from memory instead of being re-calculated.

If the wallet was instantiated using an encrypted `keystore`, than this value is already set and memoized, so calling this will return the value instantly,

If you need more information about the encrypted `keystore`, you can check out the [Web3 Secret Storage Definition](https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition).

**Usage:**
```js
import { open } from 'colony-wallet/software';

const wallet = await open({ privateKey: `0x9274...f447` });

let keystore = await wallet.keystore; // Promise rejects: You did not provide a password for encryption...

console.log(keystore); // undefined

wallet.keystore = '0fbfd56c94dc9d2578a6';

let keystore = await wallet.keystore;

console.log(keystore); // {"address":"3953...06a4","version":"0.1"}}
```

### `mnemonic`
```js
WalletInstance.mnemonic: String
```

If a _new_ wallet was instantiated, or a new instance was created via a `mnemonic` phrase, this prop will contain that _(or a new)_ phrase in the form of a `String`.

**Usage:**
```js
import { create } from 'colony-wallet/software';

const wallet = await create();

console.log(wallet.mnemonic); // load blush spray dirt random cash pear illness pulse sketch sheriff surge
```

### `derivationPath`
```js
WalletInstance.derivationPath: Promise<String>
```

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns a [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) [derivation path](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#specification-key-derivation) in the form of a `String`.

When instantiating a software wallet using a `mnemonic` phrase, this is used to re-create the `privateKey`. This defaults to `m/44'/60'/0'/0/0`, but can be manually set when creating the wallet instance.

On a hardware wallet, this is read-only, and is used to derive all the address indexes.

**Usage:**
```js
import { open } from 'colony-wallet/software';

const wallet = await open({ mnemonic: 'load blush ... sheriff surge' });

console.log(await wallet.derivationPath); // m/44'/60'/0'/0/0
```
```js
import { open } from 'colony-wallet/trezor';

const wallet = await open();

console.log(await wallet.derivationPath); // m/44'/60'/0'/0/0

await wallet.setDefaultAddress(1);

console.log(await wallet.derivationPath); // m/44'/60'/0'/0/1
```

### `otherAddresses`
```js
WalletInstance.otherAddresses: Array<String>
```

_Note: This prop is only available on Hardware Wallet types (Eg: Trezor)_.

It contains an `Array` of all the addresses that were derived initially when opening the wallet, by specifying a number to the `addressCount` prop. _(The addresses in the `Array` are in `String` format)_.

This is useful to see all the addresses that you have access to.

Note, that if only one address was derived when you opened the wallet _(Eg: `{ addressCount : 1 }`)_, than this prop will be `undefined`. This is because it will only contain one entry, which is also the default selected address _(See: [`setDefaultAddress`](#setdefaultaddress))_, so there's no point, as it will just repeat information.

**Usage:**
```js
import { open } from 'colony-wallet/trezor';

const multipleAddresesWallet = await open();

console.log(wallet.otherAddress); // [0x56B4...8173, 0x0F91...d9A8, 0x26eB...bAD1, 0xb883...49F6, 0x9d4E...7dbc, 0x4a59...8526, 0x9E8b...5C28, 0x6F29...A682, 0x4BAB...5aFb, 0x9677...9647]

console.log(wallet.otherAddress.length); // 10
```
```js
import { open } from 'colony-wallet/trezor';

const multipleAddresesWallet = await open({ addressCount: 1 });

console.log(wallet.otherAddress); // undefined
```

### `privateKey`
```js
WalletInstance.privateKey: String
```

Contains the `private key` for the wallet in `String` form. This will be available in all cases: if you created a new wallet instance, if you opened a wallet instance using either a `mnemonic` or a `private key`.

_**Warning:** As the name suggests, this is private. So treat it with caution and if possible don't expose it to other parts of your app._

**Usage:**
```js
import { open } from 'colony-wallet/software';

const wallet = await open({ mnemonic: 'load blush ... sheriff surge' });

console.log(wallet.privateKey); // 0x9274...f447
```

### `publicKey`
```js
WalletInstance.publicKey: Promise<String>
```

This is a `getter` that returns a `Promise`. Upon resolving, the promise returns the public key for the current address, in `String` form.

This is useful for cases where you want to prove the wallet's identity without exposing any private and dangerous information _(Eg: `privateKey`, `mnemonic`...)_.

_**Note:** The [Metamask Wallet](api-metamask.md) does not provide native access to the public key. But we can recover it from a signed message. So in order to access it, you will first have to sign a message (string provided), and than you'll have access to it. It will also be saved locally for future references (current selected address only), so that if you have to use it again, you won't have re-sign the message._

**Usage:**
```js
import { open } from 'colony-wallet/trezor';

const wallet = await open();

console.log(await wallet.publicKey); // 0x93f7 ... a9dd
```

### `type`
```js
WalletInstance.type: String
```

This is just a simple string value that represents the main type for the instantiated wallet object.

**Usage:**
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

**Usage:**
```js
import { create } from 'colony-wallet/software';

const wallet = await create();

console.log(wallet.subtype); // ethers
```

## Methods

### `setDefaultAddress()`
```js
WalletInstance.setDefaultAddress(addressIndex: Number): Promise<Boolean>
```

_Note: This prop is only available on Hardware Wallet types (Eg: Trezor)_.

By default address, we mean the address who's details are available via the `address`, `publicKey` and `derivationPath` props, and which will be used when call-ing the `sign()`, `signMessage()` and `verifyMessage()` methods, as it can only use one at a time for these operations.

This method takes in an address index argument, as a `Number` _(this corresponds to the [`otherAddresses`](#otheraddresses) Array)_ and sets that address's value internally.

If it's can set it successfully, it will return `true`, otherwise it will `throw` an Error. The only case this will fail is if you provide an unavailable address index. _(Eg: if you opened the wallet with `{ addressCount: 1 }`, there's no other `addressIndex` that will work, except `0`)_

**Usage:**
```js
import { open } from 'colony-wallet/trezor';

const multipleAddresesWallet = await open();

console.log(wallet.address); // 0x56B4...8173

await wallet.setDefaultAddress(2);

console.log(wallet.address); // 0x0F91...d9A8
```

### `sign()`
```js
WalletInstance.sign(transactionObject: Object): Promise<String>
```

Sign an ethereum transaction using the current default address.

This method takes in an `transactionObject` Object _(See below)_, and returns the hex `String` signature wrapped inside a `Promise` _(This method is `async`)_.

The `transactionObject`'s props will be each individually validated, and if there's something wrong with one of them, it will `throw` and Error.

_**Note**: On hardware wallets this method will require some form of confirmation from the user._

_**Note**: Metamask is designed to handle it's own `nonce` count. You can manually set it, but it's advisable to leave it out of the transaction object. The only case where you would want to do override it, is when you want to change a pending transaction._

**`transactionObject` format:**
```js
transactionObject {
  gasPrice: bigNumber // The gas price you're willing to pay for this transaction, in WEI, as an instance of bigNumber. Defaults to 9000000000 WEI (9 GWEI)
  gasLimit: bigNumber // The gas limit you want for this transaction, as an instance of bigNumber. Defaults to 21000
  chainId: Number // The chain id where the transaction is going to be sent. Defaults to 1.
  nonce: Number // The nonce of the transaction. Defaults to 0.
  to: String // The destination address to send the transaction to, as a hex String. This is the only REQUIRED prop by this library
  value: bigNumber // The value you want to send to the destination address, in WEI, as an instance of bigNumber. Defaults to 1 WEI
  inputData: String // The additional input data to send in the transaction, as a hex String. Defaults to `0x00`
}
```

**Usage:**
```js
import { open } from 'colony-wallet/trezor';

const trezorWallet = await open();

const transactionSignature = await trezorWallet.sign({ to: '0x3953...a4C1' }); // 0xF990...8d91
```
```js
import { open } from 'colony-wallet/trezor';
import { utils } from 'colony-wallet';

const trezorWallet = await open();

const transaction = {
  gasPrice: utils.bigNumber('0.00000001').toWei(),
  gasLimit: utils.bigNumber(30000),
  chainId: 4,
  nonce: 15987,
  to: '0x3953...a4C1',
  value: utils.bigNumber(1).toWei(),
  inputData: '0x00',
};

const transactionSignature = await trezorWallet.sign(transaction); // 0xf849...5681
```

### `signMessage()`
```js
WalletInstance.signMessage(messageObject: Object): Promise<String>
```

Sign a message with your public key to prove your identity and ownership of the address.

This method takes in an `messageObject` Object _(See below)_, and returns the hex `String` signature wrapped inside a `Promise` _(This method is `async`)_.

The `messageObject` only has one prop, `message`, but to keep consistency with the rest of the library, it is passed in as an Object.

_**Note**: On hardware wallets this method will require some form of confirmation from the user._

**`messageObject` format:**
```js
messageObject {
  message: String // The message you want to sign, as a String. Defaults to the '' empty String
}
```

**Usage:**
```js
import { open } from 'colony-wallet/trezor';

const trezorWallet = await open();

const messageSignature = await trezorWallet.signMessage({ message: 'Yes, this is me!' }); // '0xa1f7...0b1c'
```

### `verifyMessage()`
```js
WalletInstance.verifyMessage(verificationObject: Object): Promise<Boolean>
```

Verify a previously signed message to validate your identity and prove it was indeed signed by your current account.

This method takes in an `verificationObject` Object _(See below)_, and returns a Boolean wrapped inside a `Promise` _(This method is `async`)_.

If the message _(after it gets signed internally)_ matches the provided signature, it will return `true`, otherwise it will return `false` _(And if you're in a `development` environment, also a warning)_.

_**Note**: On hardware wallets this method **may** require some form of confirmation from the user (depending on the hardware wallet type)._

**`verificationObject` format:**
```js
messageObject {
  message: String // The message you want to verify, as a String. Defaults to the '' empty String
  signature: String // The signature you want to verify the message against, as a `hex` String.
}
```

**Usage:**
```js
import { open } from 'colony-wallet/trezor';

const trezorWallet = await open();

const messageSignature = await trezorWallet.verifyMessage({
  message: 'Yes, this is me!',
  signature: '0xa1f7...0b1c'
});
```
