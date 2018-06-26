/* @flow */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';

import { payloadListener, derivationPathSerializer } from './helpers';
import { HEX_HASH_TYPE } from './defaults';
import { PAYLOAD_XPUB } from './payloads';
import { WALLET_PROP_DESCRIPTORS } from '../defaults';
import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../walletTypes';

import type { WalletArgumentsType, WalletObjectType } from '../flowtypes';

export default class TrezorWallet {
  address: string;

  addresses: Object[];

  publicKey: string;

  path: string;

  type: string;

  subtype: string;

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
        addressObject.path = derivationPathSerializer({ addressIndex: index });
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
     */
    Object.defineProperties(this, {
      address: Object.assign(
        {},
        { value: allAddresses[0].address },
        WALLET_PROP_DESCRIPTORS,
      ),
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
  static async open({
    addressCount,
  }: WalletArgumentsType = {}): Promise<WalletObjectType | void> {
    /*
     * Get the harware wallet's public key and chain code, to use for deriving
     * the rest of the accounts
     */
    const { publicKey, chainCode } = await payloadListener({
      payload: PAYLOAD_XPUB,
    });
    const walletInstance: WalletObjectType = new this(
      publicKey,
      chainCode,
      addressCount,
    );
    return walletInstance;
  }
}
