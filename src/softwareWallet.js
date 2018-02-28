/* @flow */

import { Wallet } from 'ethers';

import type { ProviderType, WalletType } from './flowtypes';

import { autoselect } from './providers';
import { getRandomValues } from './utils';

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
  const wallet = Wallet.createRandom({ extraEntrophy: entrophy });
  wallet.provider = provider;
  return wallet;
};

const softwareWallet = {
  legacyCreate,
};

export default softwareWallet;
