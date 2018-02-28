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
 * @param {ProviderType} provider An available provider to add to the wallet
 * (for use in transactions and signing)
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
      warn(warnings.softwareWallet.noEntrophy);
      wallet = Wallet.createRandom();
    } else {
      wallet = Wallet.createRandom({ extraEntrophy: entrophy });
    }
    if (!provider || (provider && typeof provider !== 'object')) {
      warn(warnings.softwareWallet.noProvider);
      return wallet;
    }
    wallet.provider = provider;
    return wallet;
  } catch (err) {
    error(errors.softwareWallet.walletCreation, provider, entrophy, err);
    return Wallet.createRandom();
  }
};

/*
 * @TODO Add software wallet async `create()` method
 * This will provide extra props like QR codes and blockies via getters
 */

const softwareWallet = {
  legacyCreate,
};

export default softwareWallet;
