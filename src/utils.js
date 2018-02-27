/* @flow */

import crypto from 'crypto';

import { ENV } from './defaults';
import { errors, warnings } from './messages';

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
 * @method warn
 *
 * @param {any} args Arguments array that will be passed down to `console.warn`
 */
export const warn = (...args: Array<*>): void => {
  if (verbose()) {
    return console.warn(...args);
  }
  return undefined;
};

/**
 * If we're in `dev` mode, show an error to the console
 *
 * @method warn
 *
 * @param {any} args Arguments array that will be passed down to `console.warn`
 */
export const error = (...args: Array<*>): void => {
  if (verbose()) {
    return console.error(...args);
  }
  return undefined;
};

/**
 * A very basic polyfill method to generate randomness for use in wallet entropy.
 * This will fall back to nodejs's `crypto` library if the browser that's using this doesn't have the `webcrypto` API implemented yet.
 *
 * @TODO Add API documentation
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
   */
  if (window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(typedArray);
  }
  /*
   * Check if `webCrypto` is available (Microsoft based browsers, most likely Edge)
   */
  if (
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
      throw new TypeError(errors.utils.getRandomValues.wrongArgumentType);
    }
    warn(warnings.utils.getRandomValues.nodeCryptoFallback);
    const randomBytesArray = crypto.randomBytes(typedArray.length);
    typedArray.set(randomBytesArray);
    return typedArray;
  }
  /*
   * We can't find any crypto method, we'll abort.
   */
  throw new Error(errors.utils.getRandomValues.noCryptoLib);
};

const utils = {
  warn,
  error,
  getRandomValues,
};

export default utils;
