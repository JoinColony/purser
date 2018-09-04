import U2fTransport from '@ledgerhq/hw-transport-u2f';
import LedgerEthApp from '@ledgerhq/hw-app-eth';

import { ledgerConnection } from '../../../ledger/helpers';

jest.dontMock('../../../ledger/helpers');

jest.mock('@ledgerhq/hw-transport-u2f');
jest.mock('@ledgerhq/hw-app-eth');

describe('`Ledger` Hardware Wallet Module Helpers', () => {
  describe('`ledgerConnection()` helper', () => {
    test('Creates a new transport', async () => {
      await ledgerConnection();
      expect(await U2fTransport.create).toHaveBeenCalled();
    });
    test('Creates a new Eth app instance', async () => {
      await ledgerConnection();
      expect(LedgerEthApp).toHaveBeenCalled();
    });
    test('The app instance has the required methods', async () => {
      const connnection = await ledgerConnection();
      /*
       * This is a little bit of cheating, since I'm creating the ledger app
       * manual mock, but I want to emphasize the required methods.
       */
      expect(connnection).toHaveProperty('getAddress');
      expect(connnection).toHaveProperty('signTransaction');
      expect(connnection).toHaveProperty('signPersonalMessage');
    });
  });
});
