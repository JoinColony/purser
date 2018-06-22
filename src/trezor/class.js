/* eslint-disable flowtype/require-valid-file-annotation */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';

import { HEX_HASH_TYPE, PATH } from './defaults';
import { PAYLOAD_XPUB } from './payloads';
import { payloadListener, derivationPathSerializer } from './helpers';

export default class TrezorWallet {
  constructor(publicKey, chainCode, addressIndex = PATH.INDEX) {
    /*
     * Derive the public key with the derivation index, so we can
     * reverse the addresses (basically first 20 bytes of the keccak256 hash)
     */
    const hdKey = new HDKey();
    hdKey.publicKey = Buffer.from(publicKey, HEX_HASH_TYPE);
    hdKey.chainCode = Buffer.from(chainCode, HEX_HASH_TYPE);
    const derivationKey = hdKey.derive(`m/${addressIndex}`);
    /*
     * Set the Wallet Object's values
     */
    this.path = derivationPathSerializer({ addressIndex });
    /*
     * This is the derrived public key, not the one originally fetched from
     * the trezor service
     */
    this.publicKey = derivationKey.publicKey.toString(HEX_HASH_TYPE);
    /*
     * Generate the address from the derived public key
     */
    this.address = SigningKey.publicKeyToAddress(
      Buffer.from(derivationKey.publicKey, HEX_HASH_TYPE),
    );
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
  static async open() {
    /*
     * Get the harware wallet's public key and chain code, to use for deriving
     * the rest of the accounts
     */
    const { publicKey, chainCode } = await payloadListener({
      payload: PAYLOAD_XPUB,
    });
    return new this(publicKey, chainCode);
  }
}
