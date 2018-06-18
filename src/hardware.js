/* @flow */

import { ENV } from './defaults';
import Trezor from './trezor';

/*
 * If we're in dev mode, also export the `SoftwareWallet` class so it's available
 * to us directly for debugging.
 */
const hardwareWallet: * = Object.assign(
  {},
  ENV === 'development' || ENV === 'test' ? { Trezor } : {},
);

export default hardwareWallet;
