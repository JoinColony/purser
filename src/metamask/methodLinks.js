/* @flow */

import type { signMessageMethodType } from './flowtypes';

/*
 * This is just to provide a nicer function name to the injected metamask
 * methods that we call.
 *
 * This assumes you do detection before trying to call them.
 */

/**
 * Sign a message. Is a wrapper for web3.personal.sign
 *
 * @method signMessage
 */
export const signMessage: signMessageMethodType = (...args) =>
  global.web3.personal.sign(...args);

const metmaskMethodLinks: Object = {
  signMessage,
};

export default metmaskMethodLinks;
