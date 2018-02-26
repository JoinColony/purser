/* @flow */

import providers from './providers';
import utils from './utils';
import { ENV } from './defaults';
import { name, version } from '../package.json';

const colonyWallet = {
  utils,
  providers,
  about: {
    name,
    version,
    environment: ENV,
  },
};

export default colonyWallet;
