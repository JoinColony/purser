/* @flow */

import { Wallet } from 'ethers';

import type { ProviderType, WalletType } from './flowtypes';

import { autoselect } from './providers';
import { getRandomValues, warn, error } from './utils';
import { warnings, errors } from './messages';

/**
 * Create a new wallet.
 *
 * This is the legacy version, as the final object will not contain any extra
 * helper values (QR codes, blockies).
 *
 * @TODO Add API documentation
 * @TODO Add address QR generator
 * @TODO Add privatekey QR generator
 * @TODO Add address blockie generator
 *
 * @method legacyCreate
 *
 * @param {ProviderType} provider An available provider to add to the wallet
 * @param {Uint8Array} entrophy An unsigned 8bit integer Array to provide extra randomness
 * @param {string} password Optional password used to generate an encrypted keystore
 *
 * @return {WalletType} A new wallet object
 */
export const legacyCreate = (
  provider: ProviderType = autoselect(),
  entrophy: Uint8Array = getRandomValues(new Uint8Array(65536)),
  password: string,
): WalletType => {
  let wallet: Object;
  let encryptionPassword: string = password;
  try {
    if (!entrophy || (entrophy && !(entrophy instanceof Uint8Array))) {
      warn(warnings.softwareWallet.legacyCreate.noEntrophy);
      wallet = Wallet.createRandom();
    } else {
      wallet = Wallet.createRandom({ extraEntrophy: entrophy });
    }
    /*
     * We're have to suppress the flow error here since apparently it doesn't
     * play well with getters and setters :(
     *
     * See: https://github.com/facebook/flow/issues/285
     */
    /* $FlowFixMe */
    Object.defineProperty(wallet, 'keystore', {
      enumerable: true,
      get(): Promise<string | void> {
        if (encryptionPassword) {
          return wallet.encrypt(encryptionPassword);
        }
        return new Promise((resolve, reject) => reject()).catch(() =>
          warn('no password'),
        );
      },
      set(newEncryptionPassword): void {
        encryptionPassword = newEncryptionPassword;
      },
    });
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
    return Wallet.createRandom();
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

const softwareWallet = {
  legacyCreate,
  openWithPrivateKey,
};

export default softwareWallet;
