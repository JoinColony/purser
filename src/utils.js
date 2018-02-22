/* @flow */

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
export const warn = (...args: Array<any>): void => {
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
export const error = (...args: Array<any>): void => {
  if (verbose()) {
    return console.error(...args);
  }
  return undefined;
};

const utils = {
  warn,
  error,
};

export default utils;
