/* @flow */

export const DEFAULT_NETWORK = 'homestead';
export const TEST_NETWORK = 'ropsten';
export const ENV = (process && process.env.NODE_ENV) || undefined;

const defaults = {
  DEFAULT_NETWORK,
  TEST_NETWORK,
  ENV,
};

export default defaults;
