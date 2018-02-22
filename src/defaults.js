/* @flow */

/*
 * Networks
 */
export const DEFAULT_NETWORK = 'homestead';
export const TEST_NETWORK = 'ropsten';

/*
 * Build environment
 */
export const ENV = (process && process.env.NODE_ENV) || 'development';

/*
 * Local provider connection defaults. Eg: parity, geth or testrpc
 */

export const LOCALPROVIDER_PROTOCOL = 'http';
export const LOCALPROVIDER_HOST = 'localhost';
export const LOCALPROVIDER_PORT = '8545';

const defaults = {
  DEFAULT_NETWORK,
  ENV,
  LOCALPROVIDER_HOST,
  LOCALPROVIDER_PORT,
  LOCALPROVIDER_PROTOCOL,
  TEST_NETWORK,
};

export default defaults;
