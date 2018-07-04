/* @flow */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';
import { fromString } from 'bip32-path';

import { payloadListener, derivationPathSerializer } from './helpers';
import { autoselect } from '../providers';
import { warning } from '../utils';
import { HEX_HASH_TYPE, PATH } from './defaults';
import {
  PAYLOAD_XPUB,
  PAYLOAD_SIGNTX,
  PAYLOAD_SIGNMSG,
  PAYLOAD_VERIFYMSG,
} from './payloads';
import { WALLET_PROP_DESCRIPTORS, MAIN_NETWORK } from '../defaults';
import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../walletTypes';

import type {
  WalletArgumentsType,
  WalletObjectType,
  ProviderType,
  TransactionObjectType,
  MessageObjectType,
} from '../flowtypes';

export default class TrezorWallet {
  /*
   * @TODO Check the `publicKey` and `chainCode` values
   *
   * If for some reason the Trezor service fails to send them in the correct format
   * eg: malware shenanigans
   */
  constructor(
    publicKey: string,
    chainCode: string,
    coinType: number,
    addressCount: number = 1,
    provider: ProviderType | void,
  ) {
    /*
     * Derive the public key with the address index, so we can get the address
     */
    const hdKey = new HDKey();
    /*
     * Sadly Flow doesn't have the correct types for node's Buffer Object
     */
    /* $FlowFixMe */
    hdKey.publicKey = Buffer.from(publicKey, HEX_HASH_TYPE);
    /*
     * Sadly Flow doesn't have the correct types for node's Buffer Object
     */
    /* $FlowFixMe */
    hdKey.chainCode = Buffer.from(chainCode, HEX_HASH_TYPE);
    /*
     * @TODO Check that `addressesCount` is a number
     */
    const allAddresses = Array.from(
      /*
       * We default again to `1`, but this time, to prevent the case where the
       * user passes in the value `0` manually (which will break the array map)
       */
      new Array(addressCount || 1),
      (value, index) => {
        const addressObject = {};
        const derivationKey = hdKey.derive(`m/${index}`);
        /*
         * @TODO Cut down on path derivation code repetition
         *
         * This happes here, and inside the `open()` static method``
         */
        addressObject.path = derivationPathSerializer({
          coinType,
          addressIndex: index,
        });
        /*
         * This is the derrived public key, not the one originally fetched from
         * the trezor service
         */
        addressObject.publicKey = derivationKey.publicKey.toString(
          HEX_HASH_TYPE,
        );
        /*
         * Generate the address from the derived public key
         */
        addressObject.address = SigningKey.publicKeyToAddress(
          /*
           * Sadly Flow doesn't have the correct types for node's Buffer Object
           */
          /* $FlowFixMe */
          Buffer.from(derivationKey.publicKey, HEX_HASH_TYPE),
        );
        return addressObject;
      },
    );
    /*
     * Set the Wallet Object's values
     *
     * We're using `defineProperties` instead of strait up assignment, so that
     * we can customize the prop's descriptors
     *
     * @TODO Reduce code repetition when setting Class props
     *
     * We do this here and in the software wallet, so it might make sense to
     * write a helper method for this.
     */
    Object.defineProperties(this, {
      address: Object.assign(
        {},
        { value: allAddresses[0].address },
        WALLET_PROP_DESCRIPTORS,
      ),
      /*
       * @TODO Make publicKey prop a getter
       *
       * While a public key is relatively safe, it's still a good idea to lock
       * it behind a getter, and not expose it directly on the Wallet Object
       */
      publicKey: Object.assign(
        {},
        { value: allAddresses[0].publicKey },
        WALLET_PROP_DESCRIPTORS,
      ),
      path: Object.assign(
        {},
        { value: allAddresses[0].path },
        WALLET_PROP_DESCRIPTORS,
      ),
      type: Object.assign(
        {},
        { value: TYPE_HARDWARE },
        WALLET_PROP_DESCRIPTORS,
      ),
      subtype: Object.assign(
        {},
        { value: SUBTYPE_TREZOR },
        WALLET_PROP_DESCRIPTORS,
      ),
      provider: Object.assign({}, { value: provider }, WALLET_PROP_DESCRIPTORS),
      /*
       * We need to add the values here as opposed to the static `signTransaction`
       * because we need access to the current instance's values (eg: `this`)
       */
      sign: Object.assign(
        {},
        {
          value: async (transactionObject: TransactionObjectType = {}) => {
            const {
              path = this.path,
              chainId = (this.provider && this.provider.chainId) || 1,
            } = transactionObject;
            return TrezorWallet.signTransaction(
              Object.assign({}, transactionObject, { path, chainId }),
            );
          },
        },
        WALLET_PROP_DESCRIPTORS,
      ),
      /*
       * We need to add the values here as opposed to the static `signMessage`
       * because we need access to the current instance's values (eg: `this`)
       */
      signMessage: Object.assign(
        {},
        {
          value: async ({
            path = this.path,
            message,
          }: MessageObjectType = {}) =>
            TrezorWallet.signMessage({ path, message }),
        },
        WALLET_PROP_DESCRIPTORS,
      ),
      /*
       * We need to add the values here as opposed to the static `vewrifyMessage`
       * because we need access to the current instance's values (eg: `this`)
       */
      verifyMessage: Object.assign(
        {},
        {
          value: async ({
            address = this.address,
            message,
            signature,
          }: MessageObjectType = {}) =>
            TrezorWallet.verifyMessage({ address, message, signature }),
        },
        WALLET_PROP_DESCRIPTORS,
      ),
    });
    /*
     * The `addresses` prop is only available if we have more than one.
     * Otherwise it's pointless since it just repeats information.
     */
    if (addressCount > 1) {
      Object.defineProperty(
        this,
        'addresses',
        Object.assign({}, { value: allAddresses }, WALLET_PROP_DESCRIPTORS),
      );
    }
  }

  address: string;

  addresses: Object[];

  publicKey: string;

  path: string;

  type: string;

  subtype: string;

  provider: ProviderType | void;

  sign: (...*) => Promise<string>;

  signMessage: (...*) => Promise<string>;

  verifyMessage: (...*) => Promise<string>;

  /**
   * Open a new wallet from the public key and chain code, which are received
   * form the Trezor service after interacting (confirming) with the hardware
   * in real life.
   *
   * @method open
   *
   * @param {number} addressCount the number of extra addresses to generate from the derivation path
   * @param {ProviderType} provider An available provider to add to the wallet
   *
   * The above param is sent in as a prop of an {WalletArgumentsType} object.
   *
   * @return {WalletType} The wallet object resulted by instantiating the class
   * (Object is wrapped in a promise).
   *
   */
  static async open({
    addressCount,
    /*
     * @TODO Add provider deptrecation warning
     *
     * As we have roadmapped to separate providers from the actual wallet
     */
    provider = autoselect,
  }: WalletArgumentsType = {}): Promise<WalletObjectType | void> {
    const { COIN_MAINNET, COIN_TESTNET } = PATH;
    /*
     * Get the provider.
     * If it's a provider generator, execute the function and get it's return
     */
    let providerMode =
      typeof provider === 'function' ? await provider() : provider;
    let coinType = COIN_MAINNET;
    if (typeof provider !== 'object' && typeof provider !== 'function') {
      /*
       * @TODO Add no provider set warning message
       */
      warning('No provider set');
      providerMode = undefined;
    }
    /*
     * If we're on a testnet set the coin type id to `1`
     * This will be used in the derivation path
     */
    if (
      providerMode &&
      (!!providerMode.testnet || providerMode.name !== MAIN_NETWORK)
    ) {
      coinType = COIN_TESTNET;
    }
    /*
     * Modify the default payload to overwrite the path with the new
     * coid type id derivation
     */
    const modifiedPayloadObject: Object = Object.assign({}, PAYLOAD_XPUB, {
      path: fromString(
        derivationPathSerializer({ coinType }),
        true,
      ).toPathArray(),
    });
    /*
     * Get the harware wallet's public key and chain code, to use for deriving
     * the rest of the accounts
     */
    const { publicKey, chainCode } = await payloadListener({
      payload: modifiedPayloadObject,
    });
    const walletInstance: WalletObjectType = new this(
      publicKey,
      chainCode,
      coinType,
      addressCount,
      providerMode,
    );
    return walletInstance;
  }

  /**
   * Sign a transaction and return the signed transaction.
   *
   * The signed transaction is composed of:
   * - Signature R component
   * - Signature S component
   * - Signature V component (recovery parameter)
   *
   * @TODO Validate transaction prop values
   * Something like `assert()` should work well here
   *
   * @method signTransaction
   *
   * @param {string} path the derivation path for the account with which to sign the transaction
   * @param {string} gasPrice gas price for the transaction (as a `hex` string)
   * @param {string} gasLimit gas limit for the transaction (as a `hex` string)
   * @param {number} chainId the id of the chain for which this transaction is intended
   * @param {string} nonce the nonce to use for the transaction (as a `hex` string)
   * @param {string} to the address to which to transaction is sent
   * @param {string} value the value of the transaction (as a `hex` string)
   * @param {string} data data appended to the transaction (as a `hex` string)
   *
   * All the above params are sent in as props of an {TransactionObjectType} object.
   *
   * @return {Promise<Object>} the signed transaction composed of the three signature components (see above).
   */
  static async signTransaction({
    path,
    gasPrice,
    gasLimit,
    chainId,
    /*
     * We can't currently use the object spread operator here because of some
     * Eslint 5 and airbnb ruleset lack of compatibility.
     *
     * @TODO Fix object spread operator
     */
    nonce,
    to,
    value,
    data,
  }: TransactionObjectType) {
    /*
     * Modify the default payload to set the transaction details
     */
    const modifiedPayloadObject: Object = Object.assign({}, PAYLOAD_SIGNTX, {
      /*
       * Path needs to be sent in as an derivation path array
       */
      address_n: fromString(path, true).toPathArray(),
      gas_price: gasPrice,
      gas_limit: gasLimit,
      chain_id: chainId,
      nonce,
      to,
      value,
      data,
    });
    return payloadListener({
      payload: modifiedPayloadObject,
    });
  }

  /**
   * Sign a message and return the signed signature. Usefull for varifying addresses.
   * (In conjunction with `verifyMessage`)
   *
   * @TODO Validate message prop values
   * Something like `assert()` should work well here
   *
   * @method signMessage
   *
   * @param {string} path the derivation path for the account with which to sign the message
   * @param {string} message the message you want to sign
   *
   * All the above params are sent in as props of an {MessageObjectType} object.
   *
   * @return {Promise<Object>} The signed message as an object, containing the signer address and the signature (in `hex` format)
   */
  static async signMessage({ path, message }: MessageObjectType) {
    return payloadListener({
      payload: Object.assign({}, PAYLOAD_SIGNMSG, {
        /*
         * Path needs to be sent in as an derivation path array
         */
        path: fromString(path, true).toPathArray(),
        message,
      }),
    });
  }

  /**
   * Verify a signed message. Usefull for varifying addresses. (In conjunction with `signMessage`)
   *
   * @TODO Validate message prop values
   * Something like `assert()` should work well here
   *
   * @method verifyMessage
   *
   * @param {string} address The address that verified the original message (without the hex `0x` identifier)
   * @param {string} message The message to verify if it was signed correctly
   * @param {string} signature The message signature as a `hex` string (you usually get this via `signMessage`)
   *
   * All the above params are sent in as props of an {MessageObjectType} object.
   *
   * @return {Promise<Object>} An object with a `success` prop to indicate if the message was indeed signed by the given address
   */
  static async verifyMessage({
    address,
    message,
    signature,
  }: MessageObjectType) {
    return payloadListener({
      payload: Object.assign({}, PAYLOAD_VERIFYMSG, {
        address,
        message,
        signature,
      }),
    });
  }
}
