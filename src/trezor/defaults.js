/* @flow */

import type { WindowFeaturesType } from './flowtypes';

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
 * Ethereum reserved purpouse
 */
export const PATH_PURPOSE: number = 44;
/*
 * ETH coin type is 60 for main net, and 1 for test nets
 */
export const PATH_MAIN_COIN_TYPE: number = 60;
export const PATH_TEST_COIN_TYPE: number = 1;
export const PATH_ACCOUNT: number = 0;
export const PATH_CHANGE: number = 0;
/*
 * First address index
 */
export const PATH_ADDRESS_INDEX: number = 0;
export const SERVICE_DOMAIN: string = 'https://connect.trezor.io';
export const SERVICE_VERSION: number = 4;
export const SERVICE_URL: string = 'popup/popup.html';
export const SERVICE_KEY: string = 'v';
export const PROMPT_WIDTH: number = 600;
export const PROMPT_HEIGHT: number = 500;
export const HEX_HASH_TYPE: string = 'hex';

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

const trezorDefaults: Object = {
  PATH_PURPOSE,
  PATH_MAIN_COIN_TYPE,
  PATH_TEST_COIN_TYPE,
  PATH_ACCOUNT,
  PATH_CHANGE,
  PATH_ADDRESS_INDEX,
  SERVICE_DOMAIN,
  SERVICE_VERSION,
  SERVICE_URL,
  SERVICE_KEY,
  PROMPT_WIDTH,
  PROMPT_HEIGHT,
  WINDOW_FEATURES,
  HEX_HASH_TYPE,
};

export default trezorDefaults;
