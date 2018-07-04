/* @flow */

import { fromString } from 'bip32-path';

import { derivationPathSerializer } from './helpers';
import { FIRMWARE_MIN } from './defaults';

import type { PayloadType } from './flowtypes';

/*
 * @TODO Consider removing firmware from payload data
 *
 * And instead add them automatically at some later step
 */

export const PAYLOAD_XPUB: PayloadType = {
  type: 'xpubkey',
  path: fromString(derivationPathSerializer(), true).toPathArray(),
  requiredFirmware: FIRMWARE_MIN,
};

export const PAYLOAD_SIGNTX: PayloadType = {
  type: 'signethtx',
  requiredFirmware: FIRMWARE_MIN,
};

export const PAYLOAD_SIGNMSG: PayloadType = {
  type: 'signethmsg',
  requiredFirmware: FIRMWARE_MIN,
};

export const PAYLOAD_VERIFYMSG: PayloadType = {
  type: 'verifyethmsg',
  requiredFirmware: FIRMWARE_MIN,
};
