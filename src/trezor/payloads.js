/* @flow */

import { fromString } from 'bip32-path';

import { derivationPathSerializer } from './helpers';

import type { PayloadType } from './flowtypes';

export const PAYLOAD_XPUB: PayloadType = {
  type: 'xpubkey',
  path: fromString(derivationPathSerializer(), true).toPathArray(),
};

export const PAYLOAD_SIGNTX: PayloadType = {
  type: 'signethtx',
};

const trezorServicePayloads: Object = {
  PAYLOAD_XPUB,
  PAYLOAD_SIGNTX,
};

export default trezorServicePayloads;
