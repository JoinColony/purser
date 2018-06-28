/* @flow */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';
import { fromString } from 'bip32-path';

import { payloadListener, derivationPathSerializer } from './helpers';
import { autoselect } from '../providers';
import { warning } from '../utils';
import { HEX_HASH_TYPE, PATH } from './defaults';
import { PAYLOAD_XPUB } from './payloads';
import { WALLET_PROP_DESCRIPTORS, MAIN_NETWORK } from '../defaults';
import { TYPE_HARDWARE, SUBTYPE_TREZOR } from '../walletTypes';

import type {
  WalletArgumentsType,
  WalletObjectType,
  ProviderType,
  AsyncProviderType,
  AsyncProviderGeneratorType,
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
         * @TODO Fix serilized derivation path on final Wallet Object
         *
         * Curretly it doesn't take into account the coin type id
         *
         * The solution has to be something more elegant, since we are basically
         * doing this again in the `open()` static method :(
         */
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
      provider: Object.assign({}, { value: provider }, WALLET_PROP_DESCRIPTORS),
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
    provider = autoselect(),
  }: WalletArgumentsType = {}): Promise<WalletObjectType | void> {
    const { COIN_MAINNET, COIN_TESTNET } = PATH;
    /*
     * Get the provider.
     * If it's a provider generator, execute the function and get it's return
     */
    let providerMode: AsyncProviderType | AsyncProviderGeneratorType | void =
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
    const modifiedPayloadObject: Object = Object.assign(
      {},
      {
        payload: PAYLOAD_XPUB,
      },
    );
    modifiedPayloadObject.payload.path = fromString(
      derivationPathSerializer({ coinType }),
      true,
    ).toPathArray();
    /*
     * Get the harware wallet's public key and chain code, to use for deriving
     * the rest of the accounts
     */
    const { publicKey, chainCode } = await payloadListener(
      modifiedPayloadObject,
    );
    const walletInstance: WalletObjectType = new this(
      publicKey,
      chainCode,
      addressCount,
      providerMode,
    );
    return walletInstance;
  }
}
