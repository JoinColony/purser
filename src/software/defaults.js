/* @flow */

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

const softwareWalletDefaults: Object = {
  BLOCKIE_OPTS,
};

export default softwareWalletDefaults;
