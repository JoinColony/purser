/* @flow */
import bip32Path from 'bip32-path';

import { PATH } from './defaults';

import type { PayloadType } from './flowtypes';

export const PAYLOAD_XPUB: PayloadType = {
  type: 'xpubkey',
  path: bip32Path.fromString(PATH, true).toPathArray(),
};

const trezorServicePayloads: Object = {
  PAYLOAD_XPUB,
};

export default trezorServicePayloads;
