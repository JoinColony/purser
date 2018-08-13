/* @flow */

import type {
  signMessageMethodType,
  signTrasactionMethodType,
} from './flowtypes';

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

/**
 * Sign  transaction. Is a wrapper for web3.personal.sendTransaction
 *
 * This not only signs, but also sends the transaction, we can't have it any
 * other way with metamask (for the time being at least...)
 *
 * @method signTransaction
 */
export const signTransaction: signTrasactionMethodType = (...args) =>
  global.web3.eth.sendTransaction(...args);
