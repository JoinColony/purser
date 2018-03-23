'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _wallets = require('./wallets');

var _wallets2 = _interopRequireDefault(_wallets);

var _providers = require('./providers');

var _providers2 = _interopRequireDefault(_providers);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _defaults = require('./defaults');

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var colonyWallet = Object.assign({}, {
  wallets: _wallets2.default,
  providers: _providers2.default,
  utils: _utils2.default,
  about: {
    name: _package.name,
    version: _package.version,
    environment: _defaults.ENV
  }
}, _defaults.ENV === 'development' ? _debug2.default : {});

exports.default = colonyWallet;