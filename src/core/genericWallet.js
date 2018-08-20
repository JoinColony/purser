/* @flow */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';

import {
  safeIntegerValidator,
  hexSequenceValidator,
  addressValidator,
} from './validators';
import { addressNormalizer, hexSequenceNormalizer } from './normalizers';

import { genericClass as messages } from './messages';
import { HEX_HASH_TYPE, DESCRIPTORS, SPLITTER } from './defaults';
import { TYPE_GENERIC, SUBTYPE_GENERIC } from './types';

import type { GenericClassArgumentsType } from './flowtypes';
import type { ProviderType } from '../flowtypes';

const { GETTERS, SETTERS, WALLET_PROPS, GENERIC_PROPS } = DESCRIPTORS;

/*
 * "Private" (internal) variable(s).
 *
 * These are used as return values from getters which don't have an accompanying setter,
 * but we still want to set them internally.
 */
let internalPublicKey: string;
let internalDerivationPath: string;

/*
 * @TODO Support extra props
 *
 * Support the extra props required for the software wallet (privateKey, mnemonic, etc...)
 * Also, we need to find a way to extend both this and the `ethers` wallet class
 */
export default class GenericWallet {
  address: string;

  otherAddresses: Object[];

  /*
   * Both `publicKey` and `derivationPath` are getters.
   */

  publicKey: string;

  derivationPath: string;

  type: string;

  subtype: string;

  provider: ProviderType | void;

  setDefaultAddress: number => Promise<boolean>;

  /*
   * @TODO Add specific Flow types
   *
   * For the three main wallet methods
   */
  sign: (...*) => Promise<string>;

  signMessage: (...*) => Promise<string>;

  verifyMessage: (...*) => Promise<string>;

  constructor({
    publicKey,
    chainCode,
    rootDerivationPath,
    addressCount = 10,
    provider,
  }: GenericClassArgumentsType) {
    /*
     * Validate address count (this comes from the end user)
     */
    safeIntegerValidator(addressCount);
    /*
     * Validate the `publicKey` and `chainCode` hex sequences. These come from
     * various external services, and we shouldn't trust them.
     */
    hexSequenceValidator(publicKey);
    hexSequenceValidator(chainCode);
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
    const otherAddresses = Array.from(
      /*
       * We default to `1`, but this time, to prevent the case where the
       * user passes in the value `0` manually (which will break the array map)
       */
      new Array(addressCount || 1),
      (value, index) => {
        const addressObject = {};
        const derivationKey = hdKey.deriveChild(index);
        /*
         * Set this individual address's derivation path
         */
        addressObject.derivationPath =
          rootDerivationPath.substr(-1) === SPLITTER
            ? `${rootDerivationPath}${index}`
            : `${rootDerivationPath}${SPLITTER}${index}`;
        /*
         * This is the derrived public key, not the one originally fetched one
         */
        const derivedPublicKey = derivationKey.publicKey.toString(
          HEX_HASH_TYPE,
        );
        addressObject.publicKey = hexSequenceNormalizer(derivedPublicKey);
        /*
         * Generate the address from the derived public key
         */
        const addressFromPublicKey = SigningKey.publicKeyToAddress(
          /*
           * Sadly Flow doesn't have the correct types for node's Buffer Object
           */
          /* $FlowFixMe */
          derivationKey.publicKey,
        );
        /*
         * Also validate the address that comes from the `HDKey` library.
         */
        addressValidator(addressFromPublicKey);
        addressObject.address = addressNormalizer(addressFromPublicKey);
        return addressObject;
      },
    );
    /*
     * Set the "private" (internal) variables values
     */
    internalPublicKey = otherAddresses[0].publicKey;
    internalDerivationPath = otherAddresses[0].derivationPath;
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
      address: Object.assign({}, { value: otherAddresses[0].address }, SETTERS),
      type: Object.assign({}, { value: TYPE_GENERIC }, GENERIC_PROPS),
      subtype: Object.assign({}, { value: SUBTYPE_GENERIC }, GENERIC_PROPS),
      provider: Object.assign({}, { value: provider }, WALLET_PROPS),
      /**
       * Set the default address/public key/path one of the (other) addresses from the array.
       * This is usefull since most methods (sign, signMessage) use this props as defaults.
       *
       * There's an argument to be made here that we can derive new addresses only when this
       * method gets called.
       *
       * This would be helpful to offload the initial cost of deriving a number
       * of `addressCount` addresses.
       *
       * On the other hand, if we do this, we won't be able to show the user what
       * addresses are available up front.
       *
       * @method setDefaultAddress
       *
       * @param {number} addressIndex The address index from the array
       *
       * @return {Promise<boolean>} True if it was able to set it, false otherwise
       */
      setDefaultAddress: Object.assign(
        {},
        {
          /*
           * @TODO Accept both number and object as argument
           * To make the arguments consistent across the wallet instance methods
           */
          value: async (addressIndex: number = 0): Promise<boolean> => {
            safeIntegerValidator(addressIndex);
            if (addressIndex >= 0 && addressIndex < otherAddresses.length) {
              /*
               * Address count will always be at least `1` (the first derived address).
               *
               * This method is useful (can be used) only when the user generated more than
               * one address when instantiating the Wallet.
               */
              this.address = otherAddresses[addressIndex].address;
              internalPublicKey = otherAddresses[addressIndex].publicKey;
              internalDerivationPath =
                otherAddresses[addressIndex].derivationPath;
              return true;
            }
            throw new Error(
              `${
                messages.addressIndexOutsideRange
              }: index (${addressIndex}) count (${addressCount})`,
            );
          },
        },
        WALLET_PROPS,
      ),
      /*
       * These are just a placeholder static methods. They should be replaced (or deleted at least)
       * with methods that actually has some functionality.
       */
      sign: Object.assign({}, { value: async () => {} }, GENERIC_PROPS),
      signMessage: Object.assign({}, { value: async () => {} }, GENERIC_PROPS),
      verifyMessage: Object.assign(
        {},
        { value: async () => {} },
        GENERIC_PROPS,
      ),
    });
    /*
     * The `otherAddresses` prop is only available if we have more than one.
     *
     * Otherwise it's pointless since it just repeats information (first index
     * is also the default one).
     */
    if (addressCount > 1) {
      Object.defineProperty(
        (this: any),
        'otherAddresses',
        Object.assign(
          {},
          {
            /*
             * Map out the publicKey and derivation path from the `otherAddresses`
             * array that gets assigned to the Wallet instance.
             *
             * The user should only have access to `the publicKey` and `derivationPath` from the
             * default account (set via `setDefaultAddress()`)
             */
            value: otherAddresses.map(({ address }) => address),
          },
          WALLET_PROPS,
        ),
      );
    }
  }

  /*
   * Public Key Getter
   */
  /* eslint-disable-next-line class-methods-use-this */
  get publicKey(): Promise<string> {
    return Promise.resolve(internalPublicKey);
  }

  /* eslint-disable-next-line class-methods-use-this */
  get derivationPath(): Promise<string> {
    return Promise.resolve(internalDerivationPath);
  }
}

/*
 * We need to use `defineProperties` to make props enumerable.
 * When adding them via a `Class` getter/setter it will prevent that by default
 */
Object.defineProperties((GenericWallet: any).prototype, {
  publicKey: GETTERS,
  derivationPath: GETTERS,
});
