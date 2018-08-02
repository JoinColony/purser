import { derivationPathSerializer } from '../../core/helpers';
import { PATH } from '../../core/defaults';
import * as utils from '../../core/utils';

import { jsonRpc } from '../../providers';

import {
  ledgerConnection,
  handleLedgerConnectionError,
} from '../../ledger/helpers';
import ledgerWallet from '../../ledger';
import LedgerWalletClass from '../../ledger/class';

jest.mock('../../ledger/class');
jest.mock('../../core/helpers');
jest.mock('../../core/utils');

/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../ledger/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../ledger/__remocks__/helpers'),
);

describe('Ledger` Hardware Wallet Module', () => {
  afterEach(() => {
    LedgerWalletClass.mockReset();
    LedgerWalletClass.mockRestore();
  });
  describe('`open()` static method with defaults', () => {
    test('Open the wallet with defaults', async () => {
      await ledgerWallet.open();
      /*
       * Expect to use the correct coin type
       */
      expect(derivationPathSerializer).toHaveBeenCalled();
      expect(derivationPathSerializer).toHaveBeenCalledWith({
        coinType: PATH.COIN_MAINNET,
      });
      /*
       * Instantiates the ledger connection
       */
      expect(ledgerConnection).toHaveBeenCalled();
      /*
       * Instantiates the LedgerWallet class
       */
      expect(LedgerWalletClass).toHaveBeenCalled();
    });
    test('Open the wallet with 20 addresss', async () => {
      const addressesToOpen = 20;
      await ledgerWallet.open({ addressCount: addressesToOpen });
      expect(LedgerWalletClass).toHaveBeenCalled();
      expect(LedgerWalletClass).toHaveBeenCalledWith(
        /*
        * We only care about the address count
        */
        expect.objectContaining({
          addressCount: addressesToOpen,
        }),
      );
    });
    test('Open the wallet and set a provider', async () => {
      await ledgerWallet.open({ provider: jsonRpc });
      expect(LedgerWalletClass).toHaveBeenCalled();
      expect(LedgerWalletClass).toHaveBeenCalledWith(
        /*
        * We only care that the provider generator method gets instantiated
        */
        expect.objectContaining({
          provider: await jsonRpc(),
        }),
      );
      /*
       * We have a deprecation warning
       */
      expect(utils.warning).toHaveBeenCalled();
    });
    test('Throw if something else goes wrong', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error along the way
       */
      ledgerConnection.mockRejectedValueOnce(new Error());
      await ledgerWallet.open();
      expect(LedgerWalletClass).not.toHaveBeenCalled();
      /*
       * Handles the specific transport error
       */
      expect(handleLedgerConnectionError).toHaveBeenCalled();
    });
  });
});
