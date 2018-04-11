'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


/*
 * Networks
 */
var DEFAULT_NETWORK = exports.DEFAULT_NETWORK = 'homestead'; /* eslint-disable flowtype/require-valid-file-annotation */

var TEST_NETWORK = exports.TEST_NETWORK = 'ropsten';

/*
 * Build environment
 */
var ENV = exports.ENV = process && 'development' || 'development';

/*
 * Local provider connection defaults. Eg: parity, geth or testrpc
 */

var LOCALPROVIDER_PROTOCOL = exports.LOCALPROVIDER_PROTOCOL = 'http';
var LOCALPROVIDER_HOST = exports.LOCALPROVIDER_HOST = 'localhost';
var LOCALPROVIDER_PORT = exports.LOCALPROVIDER_PORT = '8545';

/*
 * Used to supland the provider object when a connection to a provider could
 * not be established
 */
var PROVIDER_PROTO = exports.PROVIDER_PROTO = {
  chainId: 0,
  ensAddress: '',
  name: DEFAULT_NETWORK,
  testnet: false,
  url: '',
  _events: {}
};

/*
 * Default class getter props to set on the resulting's object property.
 * Most likely to be used with `Object.defineProperty()`
 */
var GETTER_PROP_DESCRIPTORS = exports.GETTER_PROP_DESCRIPTORS = {
  enumerable: true,
  configurable: true
};

/*
 * Default wallet instance object props
 * Most likely to be used with `Object.defineProperty()`
 */
var WALLET_PROP_DESCRIPTORS = exports.WALLET_PROP_DESCRIPTORS = {
  enumerable: true,
  writable: false
};

/*
 * Default options used to pass down to the QR code generator.
 * Note: They are specific to the `qrcode` library.
 */
var QR_CODE_OPTS = exports.QR_CODE_OPTS = {
  margin: 0,
  errorCorrectionLevel: 'H',
  width: 200
};

var MNEMONIC_PATH = exports.MNEMONIC_PATH = "m/44'/60'/0'/0/0";

/*
 * Default options used to pass down to the blockie generator.
 * Note: They are specific to the `ethereum-blockie` library/
 * Warning: They git version and the npm package differ (even if they
 * both claim the same version).
 * Be extra careful.
 */
var BLOCKIE_OPTS = exports.BLOCKIE_OPTS = {
  size: 8,
  scale: 25
};

var defaults = {
  BLOCKIE_OPTS: BLOCKIE_OPTS,
  DEFAULT_NETWORK: DEFAULT_NETWORK,
  ENV: ENV,
  GETTER_PROP_DESCRIPTORS: GETTER_PROP_DESCRIPTORS,
  LOCALPROVIDER_HOST: LOCALPROVIDER_HOST,
  LOCALPROVIDER_PORT: LOCALPROVIDER_PORT,
  LOCALPROVIDER_PROTOCOL: LOCALPROVIDER_PROTOCOL,
  MNEMONIC_PATH: MNEMONIC_PATH,
  PROVIDER_PROTO: PROVIDER_PROTO,
  QR_CODE_OPTS: QR_CODE_OPTS,
  TEST_NETWORK: TEST_NETWORK,
  WALLET_PROP_DESCRIPTORS: WALLET_PROP_DESCRIPTORS
};

exports.default = defaults;