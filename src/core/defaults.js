/* @flow */

import type { DerivationPathDefaultType } from './flowtypes';

/*
 * Build environment
 */
export const ENV: string = (process && process.env.NODE_ENV) || 'development';

export const PATH: DerivationPathDefaultType = {
  /*
   * Ethereum HD Wallet Bip32 Derivation path
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

/*
 * Regex to use when validating strings
 */
export const MATCH: Object = {
  DIGITS: /^\d+$/,
  ADDRESS: /^(0x)?([0-9a-fA-F]{40})$/,
  /*
   * Just like the address above, but without the character number limit
   */
  HEX_STRING: /^(0x)?([0-9a-fA-F]+)$/,
  URL: /^.+:\/\/[^‌​/]+/,
};

/*
 * Used to separate misc. derivation paths or urls
 */
export const SPLITTER: string = '/';

/*
 * Used to better inform the user when a variable doesn't have a value
 * (Used in Error messsages)
 */
export const UNDEFINED: string = 'undefined';

/*
 * Hash types
 */
export const HEX_HASH_TYPE: string = 'hex';

export const WEI_MINIFICATION: number = 1e18;
export const GWEI_MINIFICATION: number = 1e9;

/*
 * Default class descriptors.
 * Most likely to be used with `Object.defineProperty()`
 */
export const DESCRIPTORS: Object = {
  GETTERS: {
    enumerable: true,
    configurable: true,
  },
  SETTERS: {
    enumerable: true,
    writable: true,
  },
  WALLET_PROPS: {
    enumerable: true,
    writable: false,
  },
  GENERIC_PROPS: {
    enumerable: true,
    writable: true,
    configurable: true,
  },
};
