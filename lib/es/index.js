

import wallets from './wallets';

import providers from './providers';
import utils from './utils';
import debug from './debug';

import { ENV } from './defaults';
import { name, version } from '../package.json';

var colonyWallet = Object.assign({}, {
  wallets: wallets,
  providers: providers,
  utils: utils,
  about: {
    name: name,
    version: version,
    environment: ENV
  }
}, ENV === 'development' ? debug : {});

export default colonyWallet;