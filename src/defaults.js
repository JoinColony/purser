/* @flow */

import type { ProviderType } from './flowtypes';

/*
 * Networks
 */
export const MAIN_NETWORK: string = 'homestead';
export const TEST_NETWORK: string = 'ropsten';

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
