/* @flow */

import type { WindowFeaturesType } from './flowtypes';

/*
 * Trezor service Url
 */
export const SERVICE_DOMAIN: string = 'https://connect.trezor.io';
export const SERVICE_VERSION: number = 4;
export const SERVICE_URL: string = 'popup/popup.html';
export const SERVICE_KEY: string = 'v';

/*
 * Trezor service prompt window name
 */
export const WINDOW_NAME: string = 'trezor-service-connection';

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
   * we want to center the prompt in the middle of the screen.
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
  INVALID_SIGN: 'Invalid signature',
};
