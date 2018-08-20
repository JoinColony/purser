/* @flow */

/* Dependencies */
import ethers from 'ethers';
import qrcode from 'qrcode';
import blockies from 'ethereum-blockies';
import bip32Path from 'bip32-path';
import bn from 'bn.js';
import ethereumJsTx from 'ethereumjs-tx';
import ethereumJsUtil from 'ethereumjs-util';
import hdkey from 'hdkey';
import ledgerEthApp from '@ledgerhq/hw-app-eth';
import ledgerU2fTransport from '@ledgerhq/hw-transport-u2f';

/* Core */
import GenericWallet from './core/genericWallet';
import * as utils from './core/utils';
import * as coreHelpers from './core/helpers';
import * as validators from './core/validators';
import * as normalizers from './core/normalizers';

/* Providers (deprecated) */
import providers from './providers';

/* Software */
import software from './software';

/* Trezor */
import TrezorWallet from './trezor/class';
import * as trezorHelpers from './trezor/helpers';

/* Ledger */
import LedgerWallet from './ledger/class';
import * as ledgerHelpers from './ledger/helpers';

/* Metamask */
import MetamaskWallet from './metamask/class';
import * as metamaskHelpers from './metamask/helpers';

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
      ethereumJsUtil,
      hdkey,
      ledger: {
        ethApp: ledgerEthApp,
        transports: {
          u2f: ledgerU2fTransport,
        },
      },
    },
    utils,
    helpers: {
      core: coreHelpers,
      trezor: trezorHelpers,
      ledger: ledgerHelpers,
      metamask: metamaskHelpers,
    },
    validators,
    normalizers,
    providers,
    walletClasses: {
      GenericWallet,
      SoftwareWallet: software.SoftwareWallet,
      TrezorWallet,
      LedgerWallet,
      MetamaskWallet,
    },
  },
};

export default debug;
