/* @flow */
import { fromString } from 'bip32-path';

import { derivationPathSerializer } from './helpers';

import type { PayloadType } from './flowtypes';

export const PAYLOAD_XPUB: PayloadType = {
  type: 'xpubkey',
  path: fromString(derivationPathSerializer(), true).toPathArray(),
};

const trezorServicePayloads: Object = {
  PAYLOAD_XPUB,
};

export default trezorServicePayloads;
