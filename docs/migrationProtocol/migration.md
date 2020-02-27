
# Migrating purser from flow-js to typescript

this is a small diary of the migration process from flow to typescript


Done with the help of this tutorial:
https://medium.com/inato/migrating-from-flow-to-typescript-why-how-worth-it-5b7703d12089


Current Strategy: Start with purser-core and then digging forward to other modules.


## typescript config changes

### dom Modules
the dom module was required for using the crypto functionality of windows
(Maybe it could be bypassed by using hashtable accessor (this['window'] instead of this.window))

### esModuleInterop flag
esModuleInterop is required for the BN.js library. see: https://github.com/CodeChain-io/codechain-primitives-js/issues/68


### Internal references

used to be `@colony/purser-core` - now they are `../purser-core`.
need to figure out how to do better.


## Known Issues

### Removed Functionality

- removed eslint for now, going to reactivate proper linting for TS later on.
- genericWallet `otherAddresses` property and in the constructor ?? added again ?! TODO: check.


## Possible Improvements

## TransactionObjectType

maybe TransactionObjectType could be replaced with the less restrictive eth-core type TransactionConfig,

´´´
export interface TransactionConfig {
    from?: string | number;
    to?: string;
    value?: number | string | BN;
    gas?: number | string;
    gasPrice?: number | string | BN;
    data?: string;
    nonce?: number;
    chainId?: number;
}
´´´

### purser-software
removed the setter purser-software keystore.

set keystore(newEncryptionPassword: string): void {
    internalEncryptionPassword = newEncryptionPassword;
}

#### Private Key is passed forward as Buffer
see privateKeyBuffer, ethereum-js privateToPublic works only with buffers.

#### Private Key from Mnemonic

SoftwareWallet requires `WalletArgumentsType` as construction argument.
In the old implementation an


## Should be tested
- support for msCrypto (Edge browser)
