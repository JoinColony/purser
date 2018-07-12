/* @flow */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';

import { signTransaction, signMessage, verifyMessage } from './staticMethods';
import {
  safeIntegerValidator,
  hexSequenceValidator,
  addressValidator,
} from './validators';
import { addressNormalizer } from './normalizers';

import { HEX_HASH_TYPE } from './defaults';
import { WALLET_PROP_DESCRIPTORS, SETTER_PROP_DESCRIPTORS } from '../defaults';
import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../walletTypes';

import type {
  ProviderType,
  TransactionObjectType,
  MessageObjectType,
} from '../flowtypes';

export default class TrezorWallet {
  address: string;

  otherAddresses: Object[];

  publicKey: string;

  path: string;

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
        addressObject.path = `${rootDerivationPath}/${index}`;
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
      /*
       * @TODO Make publicKey prop a getter
       *
       * While a public key is relatively safe, it's still a good idea to lock
       * it behind a getter, and not expose it directly on the Wallet Object
       */
      publicKey: Object.assign(
        {},
        { value: otherAddresses[0].publicKey },
        SETTER_PROP_DESCRIPTORS,
      ),
      path: Object.assign(
        {},
        { value: otherAddresses[0].path },
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
            /*
             * @TODO Throw error if index outside of range
             */
            if (addressIndex >= 0 && addressIndex <= otherAddresses.length) {
              /*
               * Address count will always be at least `1` (the first derived address).
               *
               * This method is useful (can be used) only when the user generated more than
               * one address when instantiating the Wallet.
               */
              this.address = otherAddresses[addressIndex].address;
              this.publicKey = otherAddresses[addressIndex].publicKey;
              this.path = otherAddresses[addressIndex].path;
              return true;
            }
            return false;
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
            const {
              chainId = (this.provider && this.provider.chainId) || 1,
            } = transactionObject;
            return signTransaction(
              Object.assign({}, transactionObject, {
                path: this.path,
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
            signMessage({ path: this.path, message }),
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
     * Otherwise it's pointless since it just repeats information.
     *
     * @TODO `otherAddresses` array should be a getter
     * So not available by default
     */
    if (addressCount > 1) {
      Object.defineProperty(
        this,
        'otherAddresses',
        Object.assign(
          {},
          {
            /*
             * Map out the publicKey and derivation path from the `allAddresses`
             * array that gets assigned to the Wallet instance.
             *
             * The user should only have access to the publicKey and path for the
             * default account (set via `setDefaultAddress()`)
             */
            value: otherAddresses.map(({ address }) => address),
          },
          WALLET_PROP_DESCRIPTORS,
        ),
      );
    }
  }
}
