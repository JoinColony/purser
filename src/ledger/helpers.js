/* @flow */

import U2fTransport from '@ledgerhq/hw-transport-u2f';
import LedgerEthApp from '@ledgerhq/hw-app-eth';

import { transportErrors as messages } from './messages';
import { HTTPS_PROTOCOL } from '../core/defaults';
import { U2F_TRANSPORT_ERROR } from './defaults';

import type { LedgerInstanceType, U2FTransportError } from './flowtypes';

/**
 * Create a new Ledger U2F transaport and connection to the Ethereum App
 *
 * @TODO Add unit tests
 *
 * @method ledgerConnection
 *
 * @return {Promise<Object>} If successfull. a new instance of the Ledger Ethereum App Class
 */
export const ledgerConnection = async (): Promise<LedgerInstanceType> => {
  const transport = await U2fTransport.create();
  return new LedgerEthApp(transport);
};

/**
 * Handle Errors thrown by the Ledger U2F transaport
 *
 * @TODO Add unit tests
 *
 * @NOTE This method is designed to handle the Error after it has been caught,
 * not to handle the actual catching itself.
 * SO the most obvious place to use it is inside a `catch` block
 *
 * @method handleLedgerConnectionError
 *
 * @param {Error} errorInstance The caught Error
 * @param {String} specificMethodErrorMessage An extra error message, for method caught errors
 */
export const handleLedgerConnectionError = async (
  /*
   * If the caught Error was thrown by the U2F transaport this will be an extended
   * instance of the Error Object.
   */
  errorInstance: U2FTransportError,
  /*
   * This is just a string message to use for Errors that don't come from the transport
   */
  specificMethodErrorMessage: string = '',
): Promise<void> => {
  const u2fSupport = await U2fTransport.isSupported();
  let errorMessage = messages.notSupported;
  if (errorInstance instanceof Error) {
    if (u2fSupport && specificMethodErrorMessage) {
      errorMessage = specificMethodErrorMessage;
    }
    if (window.location.protocol !== HTTPS_PROTOCOL) {
      errorMessage = messages.notSecure;
    }
    if (u2fSupport && errorInstance.id === U2F_TRANSPORT_ERROR.TIMEOUT) {
      errorMessage = messages.timeout;
    }
  }
  throw new Error(errorMessage);
};
