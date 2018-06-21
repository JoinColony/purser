/* eslint-disable flowtype/require-valid-file-annotation */

import { SigningKey } from 'ethers/wallet';
import bip32Path from 'bip32-path';
import HDKey from 'hdkey';

const TREZOR_FIRST_ACCOUNT_PATH = "m/44'/60'/0'/0";
const TREZOR_DOMAIN = 'https://connect.trezor.io';
const TREZOR_SERVICE_VERSION = 4;
const TREZOR_SERVICE_URL = 'popup/popup.html';
const TREZOR_SERVICE_KEY = 'v';
const PROMPT_WIDTH = 600;
const PROMPT_HEIGHT = 500;

export class TrezorWallet {
  constructor(publicKey, chainCode) {
    /*
     * Derive the public key with the derivation index, so we can
     * reverse the addresses (basically first 20 bytes of the keccak256 hash)
     */
    const hdKey = new HDKey();
    hdKey.publicKey = Buffer.from(publicKey, 'hex');
    hdKey.chainCode = Buffer.from(chainCode, 'hex');
    const derivationKey = hdKey.derive(`m/0`);
    /*
     * Set the Wallet Object's values
     */
    this.path = TREZOR_FIRST_ACCOUNT_PATH;
    this.publicKey = derivationKey.publicKey.toString('hex');
    this.account = SigningKey.publicKeyToAddress(
      Buffer.from(derivationKey.publicKey, 'hex'),
    );
  }

  async publicKey() {
    return this.__payloadListener({
      payload: {
        type: 'xpubkey',
        path: bip32Path
          .fromString(TREZOR_FIRST_ACCOUNT_PATH, true)
          .toPathArray(),
      },
    });
  }

  async __payloadListener({
    payload,
    origin: payloadOrigin = TREZOR_DOMAIN,
  } = {}) {
    /*
     * @TODO Handle the reject case
     *
     * This will most likely happen due to
     */
    return new Promise(resolve => {
      const prompt = this.__promptGenerator();
      const messageListener = event => {
        const { data, isTrusted, origin } = event;
        const sameOrigin =
          prompt &&
          this.__sanitizeUrl(payloadOrigin) === this.__sanitizeUrl(origin);
        if (isTrusted && sameOrigin && data === 'handshake') {
          prompt.postMessage(payload, payloadOrigin);
        }
        if (isTrusted && sameOrigin && data && data.success) {
          resolve(data);
          prompt.close();
          window.removeEventListener('message', messageListener);
        }
      };
      window.addEventListener('message', messageListener);
    });
  }

  /* eslint-disable-next-line class-methods-use-this */
  __promptGenerator({ width = PROMPT_WIDTH, height = PROMPT_HEIGHT } = {}) {
    const requestTime = new Date().getTime();
    const promptOptions = {
      width,
      height,
      /*
       * We need the actual screen size, not the browser window size, since
       * we want to center the prompt prompt in the middle of the screen.
       */
      left: (window.screen.width - width) / 2,
      top: (window.screen.height - height) / 2,
      menubar: false,
      toolbar: false,
      location: false,
      personalbar: false,
      status: false,
    };
    const promptOptionsString = Object.keys(promptOptions).reduce(
      (optionsString, option) =>
        `${optionsString}${option}=${
          promptOptions[option] === false ? 'no' : promptOptions[option]
        },`,
      '',
    );
    return window.open(
      `${TREZOR_DOMAIN}/${TREZOR_SERVICE_VERSION}` +
        `/${TREZOR_SERVICE_URL}?${TREZOR_SERVICE_KEY}=${requestTime}`,
      'trezor-service-connection',
      promptOptionsString,
    );
  }

  /* eslint-disable-next-line class-methods-use-this */
  __sanitizeUrl(url) {
    if (typeof url === 'string') {
      return url.match(/^.+:\/\/[^‌​/]+/)[0];
    }
    return '';
  }

  static async open() {
    const { publicKey, chainCode } = await this.prototype.publicKey();
    return new this(publicKey, chainCode);
  }
}

export const open = () => TrezorWallet.open();

export const create = () =>
  console.log(
    "Cannot create a new wallet, it's harware",
    'generated via the derived HD path',
  );
