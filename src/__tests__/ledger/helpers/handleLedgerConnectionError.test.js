import U2fTransport from '@ledgerhq/hw-transport-u2f';

import { handleLedgerConnectionError } from '../../../ledger/helpers';
import { transportErrors as messages } from '../../../ledger/messages';
import { U2F_TRANSPORT_ERROR } from '../../../ledger/defaults';

jest.dontMock('../../../ledger/helpers');

jest.mock('@ledgerhq/hw-transport-u2f');
/*
 * We're manually mocking the messages export, so we can test agains the messages
 */
jest.mock('../../../ledger/messages', () => ({
  /*
   * For some reason Jest dones't like us importing variables (out of scope),
   * even if we prepend the name with `mock`.
   *
   * It's something to do with this:
   * https://github.com/facebook/jest/issues/2567
   */
  transportErrors: {
    notSupported: 'mocked-not-supported',
    notSecure: 'mocked-not-secure',
    timeout: 'mocked-timeout',
  },
}));

/*
 * A little bit of trickery, so we can set the global window location protocol
 * (Otherwise, it's set by default to JSDom)
 */
delete global.window;
global.window = {
  location: {
    protocol: 'https:',
  },
};

/*
 * Common values
 */
const mockedError = new Error('Oh no!');

describe('`Ledger` Hardware Wallet Module Helpers', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  describe('`handleLedgerConnectionError()` helper', () => {
    test('Checks if U2F is supported', async () => {
      expect(handleLedgerConnectionError()).rejects.toThrow();
      expect(await U2fTransport.isSupported).toHaveBeenCalled();
    });
    test('Falls back to the default error message', async () => {
      expect(handleLedgerConnectionError()).rejects.toThrowError(
        messages.notSupported,
      );
    });
    test('Handles the specific error message', async () => {
      const mockedSpecificErrorMessage = 'This is very specific';
      expect(
        handleLedgerConnectionError(mockedError, mockedSpecificErrorMessage),
      ).rejects.toThrowError(mockedSpecificErrorMessage);
    });
    test('Handles the specific error message', async () => {
      global.window.location.protocol = 'http:';
      expect(handleLedgerConnectionError(mockedError)).rejects.toThrowError(
        messages.notSecure,
      );
    });
    test('Handles the U2F timeout error', async () => {
      mockedError.id = U2F_TRANSPORT_ERROR.TIMEOUT;
      expect(handleLedgerConnectionError(mockedError)).rejects.toThrowError(
        messages.timeout,
      );
    });
  });
});
