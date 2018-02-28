/* eslint-disable flowtype/require-valid-file-annotation */

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

const defaults = {
  DEFAULT_NETWORK,
  ENV,
  LOCALPROVIDER_HOST,
  LOCALPROVIDER_PORT,
  LOCALPROVIDER_PROTOCOL,
  TEST_NETWORK,
};

export default defaults;
