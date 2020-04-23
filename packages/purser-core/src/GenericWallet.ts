import { computeAddress } from 'ethers/utils';
import HDKey from 'hdkey';

import {
  safeIntegerValidator,
  hexSequenceValidator,
  addressValidator,
} from './validators';
import { addressNormalizer, hexSequenceNormalizer } from './normalizers';

import { genericClass as messages } from './messages';
import { HEX_HASH_TYPE, SPLITTER, CHAIN_IDS } from './constants';
import {
  AddressObject,
  WalletType,
  WalletSubType,
  GenericClassArgumentsType,
} from './types';

/*
 * @TODO Support extra props
 *
 * Support the extra props required for the software wallet (privateKey, mnemonic, etc...)
 * Also, we need to find a way to extend both this and the `ethers` wallet class
 */
export default class GenericWallet {
  /*
   * "Private" (internal) variable(s).
   *
   * These are used as return values from getters which don't have an accompanying setter,
   * but we still want to set them internally.
   */
  private addressCount: number;

  private internalPublicKey: string;

  private internalDerivationPath: string;

  private internalOtherAddresses: AddressObject[];

  address: string;

  otherAddresses: string[];

  readonly chainId: number;

  type: WalletType;

  subtype: WalletSubType;

  constructor({
    publicKey,
    chainCode,
    rootDerivationPath,
    addressCount = 10,
    chainId = CHAIN_IDS.HOMESTEAD,
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

    hdKey.publicKey = Buffer.from(publicKey, HEX_HASH_TYPE);
    hdKey.chainCode = Buffer.from(chainCode, HEX_HASH_TYPE);
    const otherAddresses = Array.from(
      /*
       * We default to `1`, but this time, to prevent the case where the
       * user passes in the value `0` manually (which will break the array map)
       */
      new Array(addressCount || 1),
      (value, index) => {
        // const addressObject : GenericClassArgumentsType = {};
        const derivationKey = hdKey.deriveChild(index);
        /*
         * Set this individual address's derivation path
         */
        const addressObjectDerivationPath =
          rootDerivationPath.substr(-1) === SPLITTER
            ? `${rootDerivationPath}${index}`
            : `${rootDerivationPath}${SPLITTER}${index}`;
        /*
         * This is the derrived public key, not the one originally fetched one
         */
        const derivedPublicKey = derivationKey.publicKey.toString(
          HEX_HASH_TYPE,
        );
        const addressObjectPublicKey = hexSequenceNormalizer(derivedPublicKey);

        /*
         * Generate the address from the derived public key
         */

        const addressFromPublicKey = computeAddress(derivationKey.publicKey);

        /*
         * Also validate the address that comes from the `HDKey` library.
         */
        addressValidator(addressFromPublicKey);

        return {
          publicKey: addressObjectPublicKey,
          derivationPath: addressObjectDerivationPath,
          address: addressNormalizer(addressFromPublicKey),
        };
      },
    );

    /*
     * Set the "private" (internal) variables values
     */
    this.internalPublicKey = otherAddresses[0].publicKey;
    this.internalDerivationPath = otherAddresses[0].derivationPath;
    this.internalOtherAddresses = otherAddresses;

    /*
     * Set the Wallet Object's values
     */
    this.addressCount = addressCount;
    this.address = otherAddresses[0].address;
    this.chainId = chainId;
    this.type = WalletType.Generic;
    this.subtype = WalletSubType.Generic;
    /*
     * The `otherAddresses` prop is only available if we have more than one.
     *
     * Otherwise it's pointless since it just repeats information (first index
     * is also the default one).
     */
    if (addressCount > 1) {
      /*
       * Map out the publicKey and derivation path from the `otherAddresses`
       * array that gets assigned to the Wallet instance.
       *
       * The user should only have access to `the publicKey` and `derivationPath` from the
       * default account (set via `setDefaultAddress()`)
       */
      this.otherAddresses = otherAddresses.map(({ address }) => address);
    } else {
      this.otherAddresses = [];
    }
  }

  async getPublicKey(): Promise<string> {
    return this.internalPublicKey;
  }

  async getDerivationPath(): Promise<string> {
    return this.internalDerivationPath;
  }

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
  async setDefaultAddress(addressIndex = 0): Promise<boolean> {
    safeIntegerValidator(addressIndex);
    if (
      addressIndex >= 0 &&
      this.otherAddresses &&
      addressIndex < this.otherAddresses.length
    ) {
      /*
       * Address count will always be at least `1` (the first derived address).
       *
       * This method is useful (can be used) only when the user generated more than
       * one address when instantiating the Wallet.
       */
      this.address = this.internalOtherAddresses[addressIndex].address;
      this.internalPublicKey = this.internalOtherAddresses[
        addressIndex
      ].publicKey;
      this.internalDerivationPath = this.internalOtherAddresses[
        addressIndex
      ].derivationPath;
      return true;
    }
    throw new Error(
      `${messages.addressIndexOutsideRange}: index (${addressIndex}) count (${this.addressCount})`,
    );
  }

  /*
   * These are just a placeholder static methods. They should be replaced (or deleted at least)
   * with methods that actually has some functionality.
   */
  // eslint-disable-next-line class-methods-use-this
  async sign(): Promise<string> {
    throw new Error('This should be implemented in the subclass');
  }

  // eslint-disable-next-line class-methods-use-this
  async signMessage(): Promise<string> {
    throw new Error('This should be implemented in the subclass');
  }

  // eslint-disable-next-line class-methods-use-this
  async verifyMessage(): Promise<boolean> {
    throw new Error('This should be implemented in the subclass');
  }
}
