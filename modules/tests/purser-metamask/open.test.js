import metamaskWallet from '@colony/purser-metamask';
import MetamaskWalletClass from '@colony/purser-metamask/class';
import {
  methodCaller,
  getInpageProvider,
} from '@colony/purser-metamask/helpers';

jest.dontMock('@colony/purser-metamask');

jest.mock('@colony/purser-metamask/class');

/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-metamask/helpers', () =>
  require('@mocks/purser-metamask/helpers'),
);

describe('Metamask` Wallet Module', () => {
  describe('`open()` static method', () => {
    test('Detect the inpage injected proxy before opening', async () => {
      await metamaskWallet.open();
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
    });
    test("Get the address value from Metamask's state", async () => {
      await metamaskWallet.open();
      /*
       * Call the helper method
       */
      expect(getInpageProvider).toHaveBeenCalled();
    });
    test('Open the wallet with defaults', async () => {
      await metamaskWallet.open();
      const mockedMetamaskProvider = getInpageProvider();
      /*
       * Instantiates the LedgerWallet class
       */
      expect(MetamaskWalletClass).toHaveBeenCalled();
      expect(MetamaskWalletClass).toHaveBeenCalledWith({
        address:
          /* eslint-disable-next-line no-underscore-dangle */
          mockedMetamaskProvider.publicConfigStore._state.selectedAddress,
      });
    });
  });
});
