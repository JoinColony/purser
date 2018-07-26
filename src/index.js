/* @flow */

import type { LibraryExportType } from './core/flowtypes';

import { bigNumber, getRandomValues } from './core/utils';
import debug from './debug';

import { ENV } from './core/defaults';
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
    utils: {
      bigNumber,
      getRandomValues,
    },
    about: {
      name,
      version,
      environment: ENV,
    },
  },
  ENV === 'development' ? debug : {},
);

export default colonyWallet;
