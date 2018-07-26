/* @flow */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';

import {
  safeIntegerValidator,
  hexSequenceValidator,
  addressValidator,
} from '../core/validators';
import { addressNormalizer, hexSequenceNormalizer } from '../core/normalizers';
import { HEX_HASH_TYPE } from '../core/defaults';

import {
  WALLET_PROP_DESCRIPTORS,
  GETTER_PROP_DESCRIPTORS,
  SETTER_PROP_DESCRIPTORS,
} from '../defaults';
import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../core/types';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';

import { classMessages as messages } from './messages';

import type {
  TransactionObjectType,
  MessageObjectType,
} from '../core/flowtypes';

import type { ProviderType } from '../flowtypes';

/*
 * "Private" (internal) variable(s).
 *
 * These are used as return values from getters which don't have an accompanying setter,
 * but we still want to set them internally.
 */
let internalPublicKey: string;
let internalDerivationPath: string;

export default class TrezorWallet {
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

  sign: (...*) => Promise<string>;

  signMessage: (...*) => Promise<string>;

  verifyMessage: (...*) => Promise<string>;

  constructor(
    publicKey: string,
    chainCode: string,
    rootDerivationPath: string,
    addressCount: number = 10,
    provider: ProviderType | void,
  ) {
    /*
     * Validate address count (this comes from the end user)
     */
    safeIntegerValidator(addressCount);
    /*
     * Validate the `publicKey` and `chainCode` hex sequences. These come from
     * Trezor's service, but we still shouldn't trust them.
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
         * Se this individual address's derivation path
         */
        addressObject.derivationPath = `${rootDerivationPath}/${index}`;
        /*
         * This is the derrived public key, not the one originally fetched from
         * the trezor service
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
          Buffer.from(derivationKey.publicKey, HEX_HASH_TYPE),
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
      address: Object.assign(
        {},
        { value: otherAddresses[0].address },
        SETTER_PROP_DESCRIPTORS,
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
        WALLET_PROP_DESCRIPTORS,
      ),
      /*
       * We need to add the values here as opposed to just passing them to
       * `signTransaction` directly because we need access to the current
       * instance's values (eg: `this`)
       */
      sign: Object.assign(
        {},
        {
          value: async (transactionObject: TransactionObjectType) => {
            /*
             * For some reason prettier always suggests a way to fix this that would
             * violate the 80 max-len rule. Wierd
             */
            /* eslint-disable prettier/prettier */
            const {
              chainId = (this.provider && this.provider.chainId) || 1,
            } = transactionObject || {};
            /* eslint-enable prettier/prettier */
            return signTransaction(
              Object.assign({}, transactionObject, {
                path: internalDerivationPath,
                chainId,
              }),
            );
          },
        },
        WALLET_PROP_DESCRIPTORS,
      ),
      /*
       * We need to add the values here as opposed to just passing them to
       * `signMessage` directly because we need access to the current
       * instance's values (eg: `this`)
       */
      signMessage: Object.assign(
        {},
        {
          value: async ({ message }: MessageObjectType = {}) =>
            signMessage({ path: internalDerivationPath, message }),
        },
        WALLET_PROP_DESCRIPTORS,
      ),
      /*
       * We need to add the values here as opposed to just passing them to
       * `verifyMessage` directly because we need access to the current
       * instance's values (eg: `this`)
       */
      verifyMessage: Object.assign(
        {},
        {
          value: async ({ message, signature }: MessageObjectType = {}) =>
            verifyMessage({ address: this.address, message, signature }),
        },
        WALLET_PROP_DESCRIPTORS,
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
          WALLET_PROP_DESCRIPTORS,
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
Object.defineProperties((TrezorWallet: any).prototype, {
  publicKey: GETTER_PROP_DESCRIPTORS,
  derivationPath: GETTER_PROP_DESCRIPTORS,
});
