/* eslint-disable flowtype/require-valid-file-annotation */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';

import { HEX_HASH_TYPE } from './defaults';
import { PAYLOAD_XPUB } from './payloads';
import { payloadListener, derivationPathSerializer } from './helpers';

import type { WalletArgumentsType } from '../flowtypes';

export default class TrezorWallet {
  /*
   * @TODO Check the `publicKey` and `chainCode` values
   *
   * If for some reason the Trezor service fails to send them in the correct format
   * eg: malware shenanigans
   */
  constructor(publicKey: string, chainCode: string, addressCount: number = 1) {
    /*
     * Derive the public key with the address index, so we can get the address
     */
    const hdKey = new HDKey();
    hdKey.publicKey = Buffer.from(publicKey, HEX_HASH_TYPE);
    hdKey.chainCode = Buffer.from(chainCode, HEX_HASH_TYPE);
    /*
     * @TODO Check that `addressesCount` is a number
     */
    const allAddresses = Array.from(new Array(addressCount), (value, index) => {
      const addressObject = {};
      const derivationKey = hdKey.derive(`m/${index}`);
      addressObject.path = derivationPathSerializer({ addressIndex: index });
      /*
       * This is the derrived public key, not the one originally fetched from
       * the trezor service
       */
      addressObject.publicKey = derivationKey.publicKey.toString(HEX_HASH_TYPE);
      /*
       * Generate the address from the derived public key
       */
      addressObject.address = SigningKey.publicKeyToAddress(
        Buffer.from(derivationKey.publicKey, HEX_HASH_TYPE),
      );
      return addressObject;
    });
    /*
     * Set the Wallet Object's values
     */
    this.address = allAddresses[0].address;
    this.publicKey = allAddresses[0].publicKey;
    this.path = allAddresses[0].path;
    /*
     * The `addresses` prop is only available if we have more than one.
     * Otherwise it's pointless since it just repeats information.
     */
    if (addressCount > 1) {
      this.addresses = allAddresses;
    }
  }

  /**
   * Open a new wallet from the public key and chain code, which are received
   * form the Trezor service after interacting (confirming) with the hardware
   * in real life.
   *
   * @method open
   *
   * @return {WalletType} The wallet object resulted by instantiating the class
   * (Object is wrapped in a promise).
   */
  static async open({ addressCount }: WalletArgumentsType = {}): Promise<
    TrezorWallet,
  > {
    /*
     * Get the harware wallet's public key and chain code, to use for deriving
     * the rest of the accounts
     */
    const { publicKey, chainCode } = await payloadListener({
      payload: PAYLOAD_XPUB,
    });
    return new this(publicKey, chainCode, addressCount);
  }
}
