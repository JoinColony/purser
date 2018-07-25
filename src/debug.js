/* @flow */

/* Dependencies */
import ethers from 'ethers';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';
import bip32Path from 'bip32-path';
import bn from 'bn.js';
import ethereumJsTx from 'ethereumjs-tx';
import hdkey from 'hdkey';
import u2f from 'u2f-api';
import ledgerEthApp from '@ledgerhq/hw-app-eth';
import ledgerGenericTransport from '@ledgerhq/hw-transport';
import ledgerU2fTransport from '@ledgerhq/hw-transport-u2f';

/* Core */
import utils from './utils';
import coreHelpers from './core/helpers';
import * as validators from './core/validators';

/* Software */
import software from './software';

/* Trezor */
import TrezorWallet from './trezor/class';
import * as trezorNormalizers from './trezor/normalizers';
import * as trezorHelpers from './trezor/helpers';

/* Ledger */

/*
 * This object was extracted in it's own export to not pollute the index,
 * as this in only available when building in `development` mode.
 */
const debug: Object = {
  debug: {
    dependencies: {
      ethers,
      qrcode,
      blockies,
      bip32Path,
      bn,
      ethereumJsTx,
      hdkey,
      u2f,
      ledger: {
        ethApp: ledgerEthApp,
        transports: {
          generic: ledgerGenericTransport,
          u2f: ledgerU2fTransport,
        },
      },
    },
    utils,
    helpers: {
      core: coreHelpers,
      trezor: trezorHelpers,
    },
    validators,
    normalizers: trezorNormalizers,
    walletClasses: {
      SoftwareWallet: software.SoftwareWallet,
      TrezorWallet,
    },
  },
};

export default debug;
