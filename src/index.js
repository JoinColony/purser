/* @flow */

import type { LibraryExportType } from './core/flowtypes';

import providers from './providers';
import utils from './utils';
import debug from './debug';

import { ENV } from './defaults';
import { name, version } from '../package.json';

import software from './software';
import trezor from './trezor';
import ledger from './ledger';

const colonyWallet: LibraryExportType = Object.assign(
  {},
  {
    wallets: {
      software,
      trezor,
      ledger,
    },
    providers,
    utils,
    about: {
      name,
      version,
      environment: ENV,
    },
  },
  ENV === 'development' ? debug : {},
);

export default colonyWallet;
