/* @flow */

import type { ProviderType } from './flowtypes';

/*
 * Networks
 */
export const MAIN_NETWORK: string = 'homestead';
export const TEST_NETWORK: string = 'ropsten';

/*
 * Build environment
 */
export const ENV: string = (process && process.env.NODE_ENV) || 'development';

/*
 * Local provider connection defaults. Eg: parity, geth or testrpc
 */

export const LOCALPROVIDER_PROTOCOL: string = 'http';
export const LOCALPROVIDER_HOST: string = 'localhost';
export const LOCALPROVIDER_PORT: string = '8545';

/*
 * Used to supland the provider object when a connection to a provider could
 * not be established
 */
export const PROVIDER_PROTO: ProviderType = {
  chainId: 0,
  ensAddress: '',
  name: MAIN_NETWORK,
  testnet: false,
  url: '',
  _events: {},
};

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
