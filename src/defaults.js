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

const defaults = {
  DEFAULT_NETWORK,
  ENV,
  LOCALPROVIDER_HOST,
  LOCALPROVIDER_PORT,
  LOCALPROVIDER_PROTOCOL,
  PROVIDER_PROTO,
  TEST_NETWORK,
};

export default defaults;
