import BN from 'bn.js';

import ExtendedBN from './ExtendedBigNumber';

import { ENV } from './constants';
import { utils as messages } from './messages';

/**
 * Simple helper to determine if we should output messages to the console
 * based on the environment the modules have been built in
 *
 * @method verbose
 *
 * @return {boolean} Do we output to the console, or not?
 */
export const verbose = (): boolean => {
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
export const warning = (...args: Array<any>): void => {
  /*
   * Stop everything if we're in production mode.
   * No point in doing all the computations and assignments if we don't have to.
   */
  if (!verbose()) {
    return undefined;
  }
  let level = 'low';
  const lastArgIndex: number = args.length - 1;
  const options = args[lastArgIndex];
  const [message] = args;
  const literalTemplates: Array<any> = args.slice(1);
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
  let warningType = 'warn';
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
 * @method getRandomValues
 *
 * @param {Uint8Array} typedArray An initial unsigned 8-bit integer array to generate randomness from
 *
 * @return {Uint8Array} A new 8-bit unsigned integer array filled with random bytes
 */
export const getRandomValues = (
  typedArray: Uint8Array = new Uint8Array(10),
): Uint8Array => {
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
    /* eslint-disable dot-notation */
    typeof window['msCrypto'] === 'object' &&
    typeof window['msCrypto'].getRandomValues === 'function'
  ) {
    return window['msCrypto'].getRandomValues(typedArray);
    /* eslint-enable dot-notation */
  }
  /*
   * We can't find any crypto method, we'll try to do our own.
   *
   * WARNING: This is really not all that secure as it relies on Javascripts'
   * internal random number generator, which isn't all that good.
   */
  warning(messages.getRandomValues.noCryptoLib);
  return typedArray.map(() => Math.floor(Math.random() * 255));
};

/**
 * Check if an expression is true and, if not, either throw an error or just log a message.
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
export const assertTruth = (params: {
  expression: boolean;
  message: string | Array<string>;
  level: string;
}): boolean => {
  if (params.expression) {
    return true;
  }
  if (params.level === undefined) {
    params.level = 'high';
  }
  if (params.level === 'high') {
    throw new Error(
      Array.isArray(params.message) ? params.message.join(' ') : params.message,
    );
  }
  if (Array.isArray(params.message)) {
    warning(...params.message);
  } else {
    warning(params.message);
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
export const bigNumber = (value: number | string | BN): ExtendedBN =>
  new ExtendedBN(value);

/**
 * Convert an object to a key (value) concatenated string.
 * This is useful to list values inside of error messages, where you can only pass in a string and
 * not the whole object.
 *
 * @method objectToErrorString
 *
 * @param {Object} object The object to convert
 *
 * @return {string} The string containing the object's key (value) pairs
 */
export const objectToErrorString = (object: Record<string, any> = {}): string =>
  Object.keys(object)
    .reduce(
      (allArgs, key) =>
        `${allArgs}${key} (${String(JSON.stringify(object[key]))}), `,
      '',
    )
    .replace(/"/g, '')
    .trim();

/**
 * Validate an (array) sequence of validation assertions (objects that are to be
 * directly passed into `assertTruth`)
 *
 * This is to reduce code duplication and boilerplate.
 *
 * @TODO Validate the validator
 * So we can have redundancy while being reduntant :)
 *
 * @method validatorGenerator
 *
 * @param {Array} validationSequenceArray An array containing objects which are in the same format as the one expect by `assertTruth`
 * @param {string} genericError A generic error message to be used for the catch all error (and if some of the other messages are missing)
 *
 * @return {boolean} It only returns true if all the validation assertions pass,
 * otherwise an Error will be thrown and this will not finish execution.
 */
export const validatorGenerator = (
  validationSequenceArray: Array<{
    expression: boolean;
    message?: string | Array<string>;
    level?: string;
  }>,
  genericError: string,
): boolean => {
  const validationTests: Array<boolean> = [];
  validationSequenceArray.map(validationSequence =>
    validationTests.push(
      assertTruth(
        /*
         * If there's no message passed in, use the generic error
         */
        {
          expression: validationSequence.expression,
          message: validationSequence.message ?? genericError,
          level: validationSequence.level ?? 'high',
        },
      ),
    ),
  );

  /*
   * This is a fail-safe in case anything spills through.
   * If any of the values are `false` throw a general Error
   */
  if (!validationTests.every(testResult => testResult === true)) {
    throw new Error(genericError);
  }
  /*
   * Everything goes well here. (But most likely this value will be ignored)
   */
  return true;
};
