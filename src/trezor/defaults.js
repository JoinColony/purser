/* @flow */

export const PATH: string = "m/44'/60'/0'/0";
export const SERVICE_DOMAIN: string = 'https://connect.trezor.io';
export const SERVICE_VERSION: number = 4;
export const SERVICE_URL: string = 'popup/popup.html';
export const SERVICE_KEY: string = 'v';
export const PROMPT_WIDTH: number = 600;
export const PROMPT_HEIGHT: number = 500;

const trezorDefaults: Object = {
  PATH,
  SERVICE_DOMAIN,
  SERVICE_VERSION,
  SERVICE_URL,
  SERVICE_KEY,
  PROMPT_WIDTH,
  PROMPT_HEIGHT,
};

export default trezorDefaults;
