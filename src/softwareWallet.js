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
 *
 * @method etherscan
 *
 * @param {ProviderType} provider An available provider to add to the wallet
 * @param {Uint8Array} entrophy An unsigned 8bit integer Array to provide
 * extra randomness
 *
 * @return {WalletType} A new wallet object
 */
export const legacyCreate = (
  provider: ProviderType = autoselect(),
  entrophy: Uint8Array = getRandomValues(new Uint8Array(65536)),
): WalletType => {
  let wallet;
  try {
    if (!entrophy || (entrophy && !(entrophy instanceof Uint8Array))) {
      warn(warnings.softwareWallet.legacyCreate.noEntrophy);
      wallet = Wallet.createRandom();
    } else {
      wallet = Wallet.createRandom({ extraEntrophy: entrophy });
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
    return Wallet.createRandom();
  }
};

/*
 * @TODO Add software wallet async `create()` method
 * This will provide extra props like QR codes and blockies via getters
 */

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
