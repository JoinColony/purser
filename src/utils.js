/* @flow */

/**
 * If we're in `dev` mode, show an warning to the console
 *
 * @method warn
 *
 * @param {any} args Arguments array that will be passed down to `console.warn`
 */
export const warn = (...args: Array<any>): void => {
  if (
    typeof ENV === 'undefined' ||
    (typeof ENV !== 'undefined' && ENV !== 'prod')
  ) {
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
  if (
    typeof ENV === 'undefined' ||
    (typeof ENV !== 'undefined' && ENV !== 'prod')
  ) {
    return console.error(...args);
  }
  return undefined;
};

const utils = {
  warn,
  error,
};

export default utils;
