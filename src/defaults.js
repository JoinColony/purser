/* eslint-disable flowtype/require-valid-file-annotation */

import type { ProviderType } from './flowtypes';

/*
 * Networks
 */
export const DEFAULT_NETWORK: string = 'homestead';
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
  name: DEFAULT_NETWORK,
  testnet: false,
  url: '',
  _events: {},
};

/*
 * Default class getter props to set on the resultin's object property.
 * Most likely to be used with `Object.defineProperty()`
 */
export const CLASS_GETTER: Object = {
  enumerable: true,
  configurable: true,
};

/*
 * Default options used to pass down to the QR code generator.
 * Note: they are specific to the `qrcode` library.
 */
export const QR_CODE_OPTS: Object = {
  margin: 0,
  errorCorrectionLevel: 'H',
};

const defaults: Object = {
  CLASS_GETTER,
  DEFAULT_NETWORK,
  ENV,
  LOCALPROVIDER_HOST,
  LOCALPROVIDER_PORT,
  LOCALPROVIDER_PROTOCOL,
  PROVIDER_PROTO,
  QR_CODE_OPTS,
  TEST_NETWORK,
};

export default defaults;
