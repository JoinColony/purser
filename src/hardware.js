/* @flow */

import trezorWallet from './trezor';

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const hardwareWallet: * = Object.assign(
  {},
  {
    trezor: trezorWallet,
  },
);

export default hardwareWallet;
