import { derivationPathSerializer } from '../../core/helpers';
import { PATH, NETWORK_IDS } from '../../core/defaults';
import * as utils from '../../core/utils';

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
    utils.warning.mockReset();
    utils.warning.mockRestore();
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
    test('Sets the derivation path coin to the mainnet type', async () => {
      await ledgerWallet.open({ chainId: NETWORK_IDS.HOMESTEAD });
      /*
       * Should set the coin to the mainnet 60 type
       */
      expect(derivationPathSerializer).toHaveBeenCalled();
      expect(derivationPathSerializer).toHaveBeenCalledWith(
        expect.objectContaining({
          coinType: PATH.COIN_MAINNET,
        }),
      );
    });
    test('Sets the derivation path coin to the testnet type', async () => {
      await ledgerWallet.open({ chainId: 123123123 });
      /*
       * Should set the coin to the testnet 1 type
       */
      expect(derivationPathSerializer).toHaveBeenCalled();
      expect(derivationPathSerializer).toHaveBeenCalledWith(
        expect.objectContaining({
          coinType: PATH.COIN_TESTNET,
        }),
      );
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
