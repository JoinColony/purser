/* @flow */
import { fromString } from 'bip32-path';

import type { PayloadType } from './flowtypes';

export const PAYLOAD_XPUB: PayloadType = {
  type: 'xpubkey',
  path: fromString("m/44'/60'/0'/0", true).toPathArray(),
};

const trezorServicePayloads: Object = {
  PAYLOAD_XPUB,
};

export default trezorServicePayloads;
