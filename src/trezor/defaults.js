/* @flow */

import type {
  WindowFeaturesType,
  DerivationPathDefaultType,
} from './flowtypes';

export const PATH: DerivationPathDefaultType = {
  /*
   * Ethereum HD Wallet Bip32 Derivation path
   *
   * @TODO there's an argument here that this should be moved into common defaults
   * and used through all of the wallet types for consistency.
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
 * Trezor service Url
 */
export const SERVICE_DOMAIN: string = 'https://connect.trezor.io';
export const SERVICE_VERSION: number = 4;
export const SERVICE_URL: string = 'popup/popup.html';
export const SERVICE_KEY: string = 'v';

/*
 * Prompt window options
 */
export const PROMPT_WIDTH: number = 600;
export const PROMPT_HEIGHT: number = 500;
export const WINDOW_FEATURES: WindowFeaturesType = {
  width: PROMPT_WIDTH,
  height: PROMPT_HEIGHT,
  /*
   * We need the actual screen size, not the browser window size, since
   * we want to center the prompt prompt in the middle of the screen.
   */
  left: (window.screen.width - PROMPT_WIDTH) / 2,
  top: (window.screen.height - PROMPT_HEIGHT) / 2,
  menubar: false,
  toolbar: false,
  location: false,
  personalbar: false,
  status: false,
};

/*
 * Hash types
 */
export const HEX_HASH_TYPE: string = 'hex';

/*
 * Firmware versions
 *
 * Note: 1.4.0 is the first version that supports ethereum
 */
export const FIRMWARE_MIN: string = '1.4.0';

/*
 * This list is not by any strech complete. It's just the ones we use.
 */
export const STD_ERRORS: Object = {
  CANCEL_ACC_EXPORT: 'Cancelled',
  CANCEL_TX_SIGN: 'Action cancelled by user',
};

/*
 * Regex to use when validating strings
 */
export const MATCH: Object = {
  DIGITS: /^\d+$/,
  ADDRESS: /^(0x)?([0-9a-fA-F]{40})$/,
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
