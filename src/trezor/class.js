/* eslint-disable flowtype/require-valid-file-annotation */

import { SigningKey } from 'ethers/wallet';
import HDKey from 'hdkey';

import { PATH } from './defaults';
import { PAYLOAD_XPUB } from './payloads';
import { payloadListener } from './helpers';

export class TrezorWallet {
  constructor(publicKey, chainCode) {
    /*
     * Derive the public key with the derivation index, so we can
     * reverse the addresses (basically first 20 bytes of the keccak256 hash)
     */
    const hdKey = new HDKey();
    hdKey.publicKey = Buffer.from(publicKey, 'hex');
    hdKey.chainCode = Buffer.from(chainCode, 'hex');
    const derivationKey = hdKey.derive('m/0');
    /*
     * Set the Wallet Object's values
     */
    this.path = PATH;
    this.publicKey = derivationKey.publicKey.toString('hex');
    this.account = SigningKey.publicKeyToAddress(
      Buffer.from(derivationKey.publicKey, 'hex'),
    );
  }

  static async publicKey() {
    return payloadListener({ payload: PAYLOAD_XPUB });
  }

  static async open() {
    const { publicKey, chainCode } = await this.publicKey();
    return new this(publicKey, chainCode);
  }
}

export const open = () => TrezorWallet.open();

export const create = () =>
  console.log(
    "Cannot create a new wallet, it's hardware",
    'generated via the derived HD path',
  );
