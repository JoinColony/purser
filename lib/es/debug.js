'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ethers = require('ethers');

var _ethers2 = _interopRequireDefault(_ethers);

var _qrcode = require('qrcode');

var _qrcode2 = _interopRequireDefault(_qrcode);

var _ethereumBlockies = require('ethereum-blockies');

var _ethereumBlockies2 = _interopRequireDefault(_ethereumBlockies);

var _wallets = require('./wallets');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SoftwareWallet = _wallets.software.SoftwareWallet;

/*
 * This object was extracted in it's own export to not pollute the index,
 * as this in only available when building in `development` mode.
 */

var debug = {
  debug: {
    ethers: _ethers2.default,
    qrcode: _qrcode2.default,
    blockies: _ethereumBlockies2.default,
    SoftwareWallet: SoftwareWallet
  }
};

exports.default = debug;