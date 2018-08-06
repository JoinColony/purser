import * as utils from '../../../core/utils';
import { messageObjectValidator } from '../../../core/helpers';
import { hexSequenceNormalizer } from '../../../core/normalizers';

import { signMessage } from '../../../ledger/staticMethods';
import {
  ledgerConnection,
  handleLedgerConnectionError,
} from '../../../ledger/helpers';

jest.dontMock('../../../ledger/staticMethods');

jest.mock('../../../core/utils');
jest.mock('../../../core/helpers');
jest.mock('../../../core/normalizers');
/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../../ledger/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../ledger/__remocks__/helpers'),
);

const derivationPath = 'mocked-derivation-path';
const mockedMessageObject = {
  derivationPath,
  message: 'mocked-message',
};

describe('`Ledger` Hardware Wallet Module Static Methods', () => {
  describe('`signMessage()` static method', () => {
    test('Calls the correct ledger app method', async () => {
      await signMessage(mockedMessageObject);
      expect(ledgerConnection.signPersonalMessage).toHaveBeenCalled();
      expect(ledgerConnection.signPersonalMessage).toHaveBeenCalledWith(
        /*
        * We only care if the derivation path is "correct"
        */
        derivationPath,
        expect.any(String),
      );
    });
    test('Validates message input values', async () => {
      /*
       * These values are not correct. Do not use the as reference.
       * If the validators wouldn't be mocked, they wouldn't pass.
       */
      await signMessage(mockedMessageObject);
      /*
       * Validates the derivation path
       */
      expect(messageObjectValidator).toHaveBeenCalled();
      expect(messageObjectValidator).toHaveBeenCalledWith(mockedMessageObject);
    });
    test('Warns the user to check/confirm the device', async () => {
      await signMessage(mockedMessageObject);
      /*
       * Calls the warning util
       */
      expect(utils.warning).toHaveBeenCalled();
    });
    test('Normalizes the return hex string', async () => {
      const {
        r: rSignatureComponent,
        s: sSignatureComponent,
        v: recoveryParameter,
      } = ledgerConnection.signPersonalMessage();
      await signMessage(mockedMessageObject);
      expect(hexSequenceNormalizer).toHaveBeenCalled();
      expect(hexSequenceNormalizer).toHaveBeenCalledWith(
        `${rSignatureComponent}${sSignatureComponent}${recoveryParameter}`,
      );
    });
    test('Catches is something goes wrong along the way', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error along the way
       */
      ledgerConnection.mockRejectedValueOnce(new Error());
      await signMessage();
      /*
       * Handles the specific transport error
       */
      expect(handleLedgerConnectionError).toHaveBeenCalled();
    });
  });
});
