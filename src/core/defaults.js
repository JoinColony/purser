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

/*
 * Default class getter props to set on the resulting's object property.
 * Most likely to be used with `Object.defineProperty()`
 */
export const GETTER_PROP_DESCRIPTORS: Object = {
  enumerable: true,
  configurable: true,
};

/*
 * Default class setter props.
 * Most likely to be used with `Object.defineProperty()`
 */
export const SETTER_PROP_DESCRIPTORS: Object = {
  enumerable: true,
  writable: true,
};

/*
 * Default wallet instance object props
 * Most likely to be used with `Object.defineProperty()`
 */
export const WALLET_PROP_DESCRIPTORS: Object = {
  enumerable: true,
  writable: false,
};

/*
 * Default options used to pass down to the QR code generator.
 * Note: They are specific to the `qrcode` library.
 */
export const QR_CODE_OPTS: Object = {
  margin: 0,
  errorCorrectionLevel: 'H',
  width: 200,
};

/*
 * Default options used to pass down to the blockie generator.
 * Note: They are specific to the `ethereum-blockie` library/
 * Warning: They git version and the npm package differ (even if they
 * both claim the same version).
 * Be extra careful.
 */
export const BLOCKIE_OPTS: Object = {
  size: 8,
  scale: 25,
};

export const WEI_MINIFICATION: number = 1e18;
export const GWEI_MINIFICATION: number = 1e9;
