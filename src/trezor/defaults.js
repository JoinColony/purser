/* @flow */

import type { PromptOptionsType } from './flowtypes';

export const PATH_INDEX: number = 0;
export const PATH: string = `m/44'/60'/0'/${PATH_INDEX}`;
export const SERVICE_DOMAIN: string = 'https://connect.trezor.io';
export const SERVICE_VERSION: number = 4;
export const SERVICE_URL: string = 'popup/popup.html';
export const SERVICE_KEY: string = 'v';
export const PROMPT_WIDTH: number = 600;
export const PROMPT_HEIGHT: number = 500;
export const HEX_HASH_TYPE: string = 'hex';

export const PROMPT_OPTIONS: PromptOptionsType = {
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
  PATH,
  PATH_INDEX,
  SERVICE_DOMAIN,
  SERVICE_VERSION,
  SERVICE_URL,
  SERVICE_KEY,
  PROMPT_WIDTH,
  PROMPT_HEIGHT,
  PROMPT_OPTIONS,
  HEX_HASH_TYPE,
};

export default trezorDefaults;
