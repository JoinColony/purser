'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.autoselect = exports.localhost = exports.metamask = exports.infura = exports.etherscan = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _providers = require('ethers/providers');

var _providers2 = _interopRequireDefault(_providers);

var _utils = require('./utils');

var _messages = require('./messages');

var _defaults = require('./defaults');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Etherscan provider generator method.
 * This wraps the `ethers` `EtherscanProvider` method and provides defaults, error catching and warnings.
 *
 * @TODO Refactor method to accept arguments as object props
 * @TODO Convert to an `async` method
 *
 * @method etherscan
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 * @param {string} token Optional (but recommended) api key to use when connecting
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
var etherscan = exports.etherscan = function etherscan() {
  var network = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaults.DEFAULT_NETWORK;
  var token = arguments[1];

  var provider = _defaults.PROVIDER_PROTO;
  try {
    if (token) {
      provider = new _providers2.default.EtherscanProvider(network, token);
      return provider;
    }
    (0, _utils.warning)(_messages.providers.etherscan.token);
    provider = new _providers2.default.EtherscanProvider(network);
  } catch (err) {
    (0, _utils.warning)(_messages.providers.etherscan.connect, network, token, err, { level: 'high' });
  }
  return provider;
};

/**
 * Infura provider generator method.
 * This wraps the `ethers` `InfuraProvider` method and provides defaults, error catching and warnings.
 *
 * @TODO Refactor method to accept arguments as object props
 * @TODO Convert to an `async` method
 *
 * @method infura
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 * @param {string} token Optional (but recommended) api key to use when connecting
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
var infura = exports.infura = function infura() {
  var network = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaults.DEFAULT_NETWORK;
  var token = arguments[1];

  var provider = _defaults.PROVIDER_PROTO;
  try {
    if (token) {
      provider = new _providers2.default.InfuraProvider(network, token);
      return provider;
    }
    (0, _utils.warning)(_messages.providers.infura.token);
    provider = new _providers2.default.InfuraProvider(network);
  } catch (err) {
    (0, _utils.warning)(_messages.providers.infura.connect, network, token, err, { level: 'high' });
  }
  return provider;
};

/**
 * Metamask provider generator method.
 * This wraps the `ethers` `Web3Provider` method and provides defaults, error catching and warnings.
 *
 * @TODO Refactor method to accept arguments as object props
 * @TODO Convert to an `async` method
 *
 * @method metamask
 *
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
var metamask = exports.metamask = function metamask() {
  var network = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaults.DEFAULT_NETWORK;

  var provider = _defaults.PROVIDER_PROTO;
  try {
    if (!global.web3 || !global.web3.currentProvider) {
      (0, _utils.warning)(_messages.providers.metamask.notAvailable);
      return provider;
    }
    provider = new _providers2.default.Web3Provider(global.web3.currentProvider, network);
  } catch (err) {
    (0, _utils.warning)(_messages.providers.metamask.connect, network, err, { level: 'high' });
  }
  return provider;
};

/**
 * Local provider generator method. Useful to connect to a local instance of geth / parity / testrpc.
 * This wraps the `ethers` `JsonRpcProvider` method and provides defaults, error catching and warnings.
 *
 * @TODO Refactor method to accept arguments as object props
 * @TODO Convert to an `async` method
 *
 * @method localhost
 *
 * @param {string} url The Json Rpc url of the localhost provider (defaults to `http://localhost:8545`)
 * @param {string} network The network name to connect to (defaults to `homestead`)
 *
 * @return {ProviderType} The provider connection object or an empty one if the connection failed.
 */
var localhost = exports.localhost = function localhost() {
  var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaults.LOCALPROVIDER_PROTOCOL + '://' + _defaults.LOCALPROVIDER_HOST + ':' + _defaults.LOCALPROVIDER_PORT;
  var network = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaults.DEFAULT_NETWORK;

  var provider = _defaults.PROVIDER_PROTO;
  try {
    /*
     * @TODO Instantly check the connection to see if the provider is up
     * Currently it will create the provider regardless, and only check if it's up when
     * sending a transaction.
     * If we check for it upfront, we can add this provider to the start of the array.
     * To implement this, we need to switch this (and maybe all) provider methods to
     * `async`s, the tradeoff in this case might not be worth it.
     */
    provider = new _providers2.default.JsonRpcProvider(url, network);
  } catch (err) {
    (0, _utils.warning)(_messages.providers.localhost.connect, url, network, err, { level: 'high' });
  }
  return provider;
};

/**
 * Helper method to autoselect from a pre-determined list of providers.
 * It will select the first one that's available.
 *
 * @TODO Convert to an `async` method
 *
 * @method autoselect
 *
 * @param {Array} providersList An array of providers to select from. Can be either a provider
 * object (ProviderType) or an provider generator method (ProviderGeneratorType)
 * @return {ProviderType} The selected provider connection object
 */
var autoselect = exports.autoselect = function autoselect() {
  var providersList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [metamask, etherscan, infura, localhost];

  var provider = _defaults.PROVIDER_PROTO;
  if (!providersList.length) {
    (0, _utils.warning)(_messages.providers.autoselect.empty, { level: 'high' });
    return provider;
  }
  for (var i = 0, l = providersList.length; i < l; i += 1) {
    if ((0, _typeof3.default)(providersList[i]) === 'object' && providersList[i].chainId) {
      provider = providersList[i];
      return provider;
    }
    if (typeof providersList[i] === 'function') {
      provider = providersList[i]();
      if (provider && provider.chainId) {
        return provider;
      }
      /*
       * Reset the provider back to an empty object if it wasn't the right format
       */
      provider = _defaults.PROVIDER_PROTO;
    }
  }
  (0, _utils.warning)(_messages.providers.autoselect.noProvider, { level: 'high' });
  return provider;
};

var colonyWallet = {
  etherscan: etherscan,
  infura: infura,
  localhost: localhost,
  metamask: metamask,
  autoselect: autoselect
};

exports.default = colonyWallet;