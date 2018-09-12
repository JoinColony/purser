import {
  derivationPathSerializer,
  userInputValidator,
} from '@colony/purser-core/helpers';
import { PATH, NETWORK_IDS } from '@colony/purser-core/defaults';
import * as utils from '@colony/purser-core/utils';

import {
  ledgerConnection,
  handleLedgerConnectionError,
} from '@colony/purser-ledger/helpers';
import ledgerWallet from '@colony/purser-ledger';
import LedgerWalletClass from '@colony/purser-ledger/class';

jest.mock('@colony/purser-ledger/class');
/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-core/helpers', () =>
  require('@mocks/purser-core/helpers'),
);
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils'),
);
jest.mock('@colony/purser-ledger/helpers', () =>
  require('@mocks/purser-ledger/helpers'),
);

describe('Ledger` Hardware Wallet Module', () => {
  afterEach(() => {
    LedgerWalletClass.mockReset();
    LedgerWalletClass.mockRestore();
    utils.warning.mockClear();
    userInputValidator.mockClear();
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
    test("Validate the user's input", async () => {
      const mockedArgumentsObject = {
        mockedArgument: 'mocked-argument',
      };
      await ledgerWallet.open(mockedArgumentsObject);
      expect(userInputValidator).toHaveBeenCalled();
      expect(userInputValidator).toHaveBeenCalledWith({
        firstArgument: mockedArgumentsObject,
      });
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
