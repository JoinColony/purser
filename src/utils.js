/* @flow */

import crypto from 'crypto';
import BN from 'bn.js';

import { ENV, WEI_MINIFICATION } from './defaults';
import { utils as messages } from './messages';

/**
 * Simple helper to determine if we should output messages to the console
 * based on the environment the modules have been built in
 *
 * @method verbose
 *
 * @return {boolean} Do we output to the console, or not?
 */
const verbose = (): boolean => {
  if (typeof ENV === 'undefined') {
    return true;
  }
  if (ENV === 'development') {
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
export const warning = (...args: Array<*>): void => {
  /*
   * Stop everything if we're in production mode.
   * No point in doing all the computations and assignments if we don't have to.
   */
  if (!verbose()) {
    return undefined;
  }
  let level: string = 'low';
  const lastArgIndex: number = args.length - 1;
  const options: * = args[lastArgIndex];
  const [message: string] = args;
  const literalTemplates: Array<*> = args.slice(1);
  /*
   * We're being very specific with object testing here, since we don't want to
   * highjack a legitimate object that comes in as a template part (althogh
   * this is very unlikely)
   */
  if (
    typeof options === 'object' &&
    typeof options.level === 'string' &&
    Object.keys(options).length === 1
  ) {
    ({ level } = options);
    literalTemplates.pop();
  }
  let warningType: string = 'warn';
  if (level === 'high') {
    warningType = 'error';
  }
  /*
   * This is actually correct since we're allowed to console warn/error by eslint,
   * it's just that it doesn't know which method we're calling (see above), so it warns by default
   */
  /* eslint-disable-next-line no-console */
  return console[warningType](
    message,
    ...literalTemplates.map(value => {
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    }),
  );
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
export const getRandomValues = (typedArray: Uint8Array): Uint8Array => {
  /*
   * Check if `webCrypto` is available (Chrome and Firefox browsers)
   *
   * Also check if the `window` global variable is avaiable if this library
   * is being used in a `node` environment
   */
  if (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    return window.crypto.getRandomValues(typedArray);
  }
  /*
   * Check if `webCrypto` is available (Microsoft based browsers, most likely Edge)
   *
   * Also check if the `window` global variable is avaiable if this library
   * is being used in a `node` environment
   */
  if (
    typeof window !== 'undefined' &&
    typeof window.msCrypto === 'object' &&
    typeof window.msCrypto.getRandomValues === 'function'
  ) {
    return window.msCrypto.getRandomValues(typedArray);
  }
  if (crypto && crypto.randomBytes) {
    /*
     * We can't find built-in methods so we rely on node's `crypto` library
     */
    if (!(typedArray instanceof Uint8Array)) {
      /*
       * Besides our instance check, this also has a an implicit check for array lengths bigger than 65536
       */
      throw new TypeError(messages.getRandomValues.wrongArgumentType);
    }
    warning(messages.getRandomValues.nodeCryptoFallback);
    const randomBytesArray = crypto.randomBytes(typedArray.length);
    typedArray.set(randomBytesArray);
    return typedArray;
  }
  /*
   * We can't find any crypto method, we'll abort.
   */
  throw new Error(messages.getRandomValues.noCryptoLib);
};

/**
 * Check if an expression is true and, if not, either throw and error or just log a message.
 *
 * Just as the `warning()` util above it uses two levels: `high` and `low`. If the set level is high (default),
 * it will throw an error, else it will just use the `warning()` method (set to `low`) to log the message
 * as an warning.
 *
 * @method assertTruth
 *
 * @param {boolean} expression The logic expression to assert
 * @param {string | Array<string>} message The message to display in case of an error
 * @param {string} level The log level: high (error) or low (warning)
 *
 * The above parameters are sent in as props of an object.
 *
 * @return {boolean} true if the expression is valid, false otherwise (and depending on the level, throw an error
 * or just log the warning)
 */
export const assertTruth = ({
  expression,
  message,
  level = 'high',
}: {
  expression: boolean,
  message: string | Array<string>,
  level?: string,
} = {}): boolean => {
  if (expression) {
    return true;
  }
  if (level === 'high') {
    throw new Error(Array.isArray(message) ? message.join(' ') : message);
  }
  if (Array.isArray(message)) {
    warning(...message);
  } else {
    warning(message);
  }
  return false;
};

/**
 * Wrapper for the `bn.js` constructor to use as an utility for big numbers
 *
 * Make sure to inform the users that this is the preffered way of interacting with
 * big numbers inside this library, as even if the underlying Big Number library will change,
 * this API will (mostly) stay the same.
 *
 * See: BigInt
 * https://developers.google.com/web/updates/2018/05/bigint
 *
 * @TODO Add internal version of methods
 * Eg: `ifromWei()` and `itoWei`. See BN's docs about prefixes and postfixes
 *
 * @method bigNumber
 *
 * @param {number | string | BN} value the value to convert to a big number
 *
 * @return {BN} The new bignumber instance
 */
export const bigNumber = (value: number | string | BN): BN => {
  const oneWei = new BN(WEI_MINIFICATION.toString());
  class ExtendedBN extends BN {
    constructor(...args) {
      super(...args);
      const ExtendedBNPrototype = Object.getPrototypeOf(this);
      const BNPrototype = Object.getPrototypeOf(ExtendedBNPrototype);
      Object.defineProperties(BNPrototype, {
        /*
         * Convert the number to WEI (multiply by 1 to the power of 18)
         */
        toWei: { value: () => this.imul(oneWei) },
        /*
         * Convert the number to WEI (multiply by 1 to the power of 18)
         */
        fromWei: { value: () => this.div(oneWei) },
      });
    }
  }
  return new ExtendedBN(value);
};

/**
 * Left pad a string with up to a number of characters
 *
 * @method padLeft
 *
 * @param {string} value the string (or value that will be converted to string) to pad
 * @param {number} length the length of the final string (from which this determines the number of padding characters)
 * @param {any} character character to use for padding (can be anything since it get converted to a string, defaults to 0)
 *
 * The above parameters are sent in as props of an object.
 *
 * @return {string} the newly padded string
 */
export const padLeft = ({
  value,
  length,
  character = 0,
}: {
  value: string,
  length: number,
  character?: any,
} = {}): string => `${String(character).repeat(length - value.length)}${value}`;

const utils: {
  warning: (...*) => void,
  getRandomValues: (...*) => Uint8Array,
  verbose?: (...*) => boolean,
  assertTruth: (...*) => boolean,
  bigNumber: (...*) => BN,
  padLeft: (...*) => string,
} = Object.assign(
  {},
  {
    warning,
    getRandomValues,
    assertTruth,
    bigNumber,
    padLeft,
  },
  /*
   * Only export the `verbose` method for testing purpouses
   */
  ENV === 'test' ? { verbose } : {},
);

export default utils;
