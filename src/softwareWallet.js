/* @flow */

import { Wallet } from 'ethers';

import type { ProviderType, WalletType } from './flowtypes';

import { autoselect } from './providers';
import { ENV } from './defaults';
import { getRandomValues, warn, error } from './utils';
import { warnings, errors } from './messages';

/*
 * "Private" variables
 */
let encryptionPassword: string;
/**
 * We extend Ethers's Wallet Object so we can add extra functionality
 *
 * @extends Wallet
 *
 * @TODO Add address QR generator
 * @TODO Add privatekey QR generator
 * @TODO Add address blockie generator
 */
class SoftwareWallet extends Wallet {
  constructor(
    privateKey: string,
    provider: ProviderType = autoselect(),
    password: string,
  ) {
    super(privateKey, provider);
    encryptionPassword = password;
  }
  keystore: string;
  get keystore(): Promise<string | void> {
    if (encryptionPassword) {
      /*
       * Memoizing the getter, so next it won't re-calculate the value
       */
      Object.defineProperty(this, 'keystore', {
        value: this.encrypt(encryptionPassword),
        writable: false,
        configurable: true,
      });
      return this.encrypt(encryptionPassword);
    }
    return new Promise((resolve, reject) => reject()).catch(() =>
      /*
       * @TODO Add decriptor message
       */
      warn('no password'),
    );
  }
  /*
   * Just set the encryption password, we don't return anything from here,
   * hence we don't have a need for `this`.
   *
   * This is just an convenince to allow us to set the encryption password
   * after the wallet has be created / instantiated.
   */
  /* eslint-disable-next-line class-methods-use-this */
  set keystore(newEncryptionPassword: string): void {
    encryptionPassword = newEncryptionPassword;
  }
}

/*
 * We need to use `defineProperty` to make the prop enumerable.
 * A standard `Class` getter/setter doesn't make it so :(
 *
 * We're dealing with `defineProperty` so we need to quiet down Flow.
 * This is becuase of Flow, and how it doesn't play well (at all, really)
 * with getters and setters. See the bellow issue for more info.
 *
 * @FIXME Remove `Flow` error suppression when it gets fixed
 * See: https://github.com/facebook/flow/issues/285
 */
/* $FlowFixMe */
Object.defineProperty(SoftwareWallet.prototype, 'keystore', {
  enumerable: true,
});

/**
 * Create a new wallet.
 *
 * This is the legacy version, as the final object will not contain any extra
 * helper values (QR codes, blockies).
 *
 * @TODO Add API documentation
 *
 * @method create
 *
 * @param {ProviderType} provider An available provider to add to the wallet
 * @param {Uint8Array} entrophy An unsigned 8bit integer Array to provide extra randomness
 * @param {string} password Optional password used to generate an encrypted keystore
 *
 * @return {WalletType} A new wallet object
 */
export const create = (
  provider: ProviderType = autoselect(),
  entrophy: Uint8Array = getRandomValues(new Uint8Array(65536)),
): WalletType => {
  let wallet: Object;
  try {
    if (!entrophy || (entrophy && !(entrophy instanceof Uint8Array))) {
      warn(warnings.softwareWallet.legacyCreate.noEntrophy);
      wallet = SoftwareWallet.createRandom();
    } else {
      wallet = SoftwareWallet.createRandom({ extraEntrophy: entrophy });
    }
    if (!provider || (provider && typeof provider !== 'object')) {
      warn(warnings.softwareWallet.legacyCreate.noProvider);
      return wallet;
    }
    wallet.provider = provider;
    return wallet;
  } catch (err) {
    error(
      errors.softwareWallet.legacyCreate.walletCreation,
      provider,
      entrophy,
      err,
    );
    return SoftwareWallet.createRandom();
  }
};

/**
 * Create a new instance of a wallet using the privatekey
 *
 * @TODO Add API documentation
 *
 * @method openWithPrivateKey
 *
 * @param {string} privatekey The private key to instanciate the wallet (it will
 * be checked for validity)
 * @param {ProviderType} provider An available provider to add to the wallet
 *
 * @return {WalletType} A new instance of the wallet
 */
export const openWithPrivateKey = (
  privateKey: string,
  provider: ProviderType = autoselect(),
): ?WalletType => {
  try {
    if (!provider || (provider && typeof provider !== 'object')) {
      warn(warnings.softwareWallet.legacyCreate.noProvider);
      return new Wallet(privateKey);
    }
    return new Wallet(privateKey, provider);
  } catch (err) {
    return error(
      errors.softwareWallet.openWithPrivateKey.cannotOpenWallet,
      privateKey,
      provider,
      err,
    );
  }
};

/*
 * If we're in dev mode, also export the SoftwareWallet class so it's available
 * to us directly for debugging.
 */
const softwareWallet: Object = Object.assign(
  {},
  {
    create,
    openWithPrivateKey,
  },
  ENV === 'development' ? { SoftwareWallet } : {},
);

export default softwareWallet;
