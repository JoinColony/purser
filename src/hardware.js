/* @flow */

import * as trezor from 'trezor.js';

import { ENV } from './defaults';

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const hardwareWallet: * = Object.assign(
  {},
  ENV === 'development' || ENV === 'test' ? { trezor } : {},
);

export default hardwareWallet;
