/* @flow */

import type { DerivationPathDefaultType } from './flowtypes';

export const PATH: DerivationPathDefaultType = {
  /*
   * Ethereum HD Wallet Bip32 Derivation path
   *
   * @TODO there's an argument to be made here that this should be moved
   * into common defaults and used through all of the wallet types for consistency.
   *
   * See the ongoing standardization discussions:
   * https://github.com/ethereum/EIPs/issues/84
   */
  /*
   * The default (and only one that is correct, as far as I know of) header key
   */
  HEADER_KEY: 'm',
  /*
   * Ethereum reserved purpouse
   */
  PURPOSE: 44,
  /*
   * ETH coin type is 60 for main net, and 1 for test nets
   */
  COIN_MAINNET: 60,
  COIN_TESTNET: 1,
  ACCOUNT: 0,
  CHANGE: 0,
  /*
   * First address index
   */
  INDEX: 0,
  /*
   * Characters seqeunce used as a deviation path delimiter
   */
  DELIMITER: "'/",
};

const coreDefaults: Object = {
  PATH,
};

export default coreDefaults;
