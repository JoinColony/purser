import metamaskWallet from '../../metamask';
import MetamaskWalletClass from '../../metamask/class';
import { methodCaller, getInpageProvider } from '../../metamask/helpers';

jest.dontMock('../../metamask/index');

jest.mock('../../metamask/class');

/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../metamask/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../metamask/__remocks__/helpers'),
);

describe('Metamask` Wallet Module', () => {
  describe('`open()` static method with defaults', () => {
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
