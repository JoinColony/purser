'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRandomValues = exports.warning = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _defaults = require('./defaults');

var _messages = require('./messages');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Simple helper to determine if we should output messages to the console
 * based on the environment the modules have been built in
 *
 * @method verbose
 *
 * @return {boolean} Do we output to the console, or not?
 */
var verbose = function verbose() {
  if (typeof _defaults.ENV === 'undefined') {
    return true;
  }
  if (_defaults.ENV === 'development') {
    return true;
  }
  return false;
};

/**
 * If we're in `dev` mode, show an warning to the console
 *
 * This way you won't have to explicitly tell it which message from `messages.js` to show
 * Arguments will be split into three types:
 *   First arg will be the message string
 *   Rest of them will be template literals that will replace %s values in the previous messsage string (with one exception)
 *   If the last argument is an object that has only one prop named `level`, it will be interpreted as an option object
 *   (if level equals `low` it will only warn, if the level equals `high`, it will error)
 *
 * @method warning
 *
 * @param {any} args Arguments array that will be passed down to `console` methods (see above)
 */


var warning = exports.warning = function warning() {
  var _console;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  /*
   * Stop everything if we're in production mode.
   * No point in doing all the computations and assignments if we don't have to.
   */
  if (!verbose()) {
    return undefined;
  }
  var level = 'low';
  var lastArgIndex = args.length - 1;
  var options = args[lastArgIndex];
  var message = args[0];

  var literalTemplates = args.slice(1);
  /*
   * We're being very specific with object testing here, since we don't want to
   * highjack a legitimate object that comes in as a template part (althogh
   * this is very unlikely)
   */
  if ((typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) === 'object' && typeof options.level === 'string' && Object.keys(options).length === 1) {
    level = options.level;

    literalTemplates.pop();
  }
  var warningType = 'warn';
  if (level === 'high') {
    warningType = 'error';
  }
  /*
   * This is actually correct since we're allowed to console warn/error by eslint,
   * it's just that it doesn't know which method we're calling (see above), so it warns by default
   */
  /* eslint-disable-next-line no-console */
  return (_console = console)[warningType].apply(_console, [message].concat((0, _toConsumableArray3.default)(literalTemplates)));
};

/**
 * A very basic polyfill method to generate randomness for use in wallet entropy.
 * This will fall back to nodejs's `crypto` library if the browser that's using this doesn't have the `webcrypto` API implemented yet.
 *
 * @TODO Lazy load the node `crypto` library (that's used as a fallback)
 *
 * @method getRandomValues
 *
 * @param {Uint8Array} typedArray An initial unsigned 8-bit integer array to generate randomness from
 *
 * @return {Uint8Array} A new 8-bit unsigned integer array filled with random bytes
 */
var getRandomValues = exports.getRandomValues = function getRandomValues(typedArray) {
  /*
   * Check if `webCrypto` is available (Chrome and Firefox browsers)
   *
   * Also check if the `window` global variable is avaiable if this library
   * is being used in a `node` environment
   */
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(typedArray);
  }
  /*
   * Check if `webCrypto` is available (Microsoft based browsers, most likely Edge)
   *
   * Also check if the `window` global variable is avaiable if this library
   * is being used in a `node` environment
   */
  if (typeof window !== 'undefined' && (0, _typeof3.default)(window.msCrypto) === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
    return window.msCrypto.getRandomValues(typedArray);
  }
  if (_crypto2.default && _crypto2.default.randomBytes) {
    /*
     * We can't find built-in methods so we rely on node's `crypto` library
     */
    if (!(typedArray instanceof Uint8Array)) {
      /*
       * Besides our instance check, this also has a an implicit check for array lengths bigger than 65536
       */
      throw new TypeError(_messages.utils.getRandomValues.wrongArgumentType);
    }
    warning(_messages.utils.getRandomValues.nodeCryptoFallback);
    var randomBytesArray = _crypto2.default.randomBytes(typedArray.length);
    typedArray.set(randomBytesArray);
    return typedArray;
  }
  /*
   * We can't find any crypto method, we'll abort.
   */
  throw new Error(_messages.utils.getRandomValues.noCryptoLib);
};

var utils = Object.assign({}, {
  warning: warning,
  getRandomValues: getRandomValues
},
/*
 * Only export the `verbose` method for testing purpouses
 */
_defaults.ENV === 'test' ? { verbose: verbose } : {});

exports.default = utils;