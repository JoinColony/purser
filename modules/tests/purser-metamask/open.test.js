import Web3Instance from 'web3';

import { warning } from '@colony/purser-core/utils';
import metamaskWallet from '@colony/purser-metamask';
import MetamaskWalletClass from '@colony/purser-metamask/class';
import {
  methodCaller,
  getInpageProvider,
} from '@colony/purser-metamask/helpers';

jest.dontMock('@colony/purser-metamask');

jest.mock('@colony/purser-metamask/class');
jest.mock('web3');

/*
 * Mocked values
 */
const mockedAddress = 'mocked-address';
const mockedEnableMethod = jest.fn(() => [mockedAddress]);

/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-metamask/helpers', () =>
  require('@mocks/purser-metamask/helpers'),
);
jest.mock('@colony/purser-core/utils', () =>
  require('@mocks/purser-core/utils'),
);

describe('Metamask` Wallet Module', () => {
  beforeEach(() => {
    global.ethereum = {
      enable: mockedEnableMethod,
    };
  });
  afterEach(() => {
    Web3Instance.mockClear();
    warning.mockClear();
    mockedEnableMethod.mockClear();
  });
  describe('`open()` static method', () => {
    test('Start in EIP-1102 mode', async () => {
      await metamaskWallet.open();
      /*
       * Enabled the account
       */
      expect(mockedEnableMethod).toHaveBeenCalled();
      /*
       * Created the Web3 Instance
       */
      expect(Web3Instance).toHaveBeenCalled();
      expect(Web3Instance).toHaveBeenCalledWith(global.ethereum);
      /*
       * We did not warn the user, we're not in legacy mode
       */
      expect(warning).not.toHaveBeenCalled();
    });
    test('Start in Legacy mode', async () => {
      global.ethereum = undefined;
      global.web3 = {
        currentProvider: {
          enable: mockedEnableMethod,
        },
      };
      await metamaskWallet.open();
      /*
       * We warn the user
       */
      expect(warning).toHaveBeenCalled();
      /*
       * Call the helper method
       */
      expect(getInpageProvider).toHaveBeenCalled();
      /*
       * Enabled the account
       */
      expect(mockedEnableMethod).toHaveBeenCalled();
      /*
       * Created the Web3 Instance
       */
      expect(Web3Instance).toHaveBeenCalled();
      /*
       * Call the helper method
       */
    });
    test('Detect the inpage provider before opening', async () => {
      await metamaskWallet.open();
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
    });
    test("Get the address from Metamask's state (legacy)", async () => {
      await metamaskWallet.open();
      /*
       * Call the helper method
       */
      expect(getInpageProvider).toHaveBeenCalled();
    });
    test('Open the wallet with defaults', async () => {
      await metamaskWallet.open();
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
      /*
       * Instantiates the Metamask class
       */
      expect(MetamaskWalletClass).toHaveBeenCalled();
      expect(MetamaskWalletClass).toHaveBeenCalledWith({
        address: mockedAddress,
      });
    });
  });
});
