import Web3 from 'web3';

import { warning } from '../../purser-core/src/utils';
import { open } from '../src/index';
import MetaMaskWallet from '../src/MetaMaskWallet';
import { methodCaller, getInpageProvider } from '../src/helpers';
import { jestMocked, testGlobal } from '../../testutils';

jest.mock('../src/MetaMaskWallet');
jest.mock('web3');
jest.mock('../src/helpers');
jest.mock('../../purser-core/src/utils');

// jestMocked doesn't work here, as the constructor is an overloaded function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockedWeb3 = (Web3 as unknown) as jest.Mock<any>;
const mockedWarning = jestMocked(warning);

/*
 * Mocked values
 */
const mockedAddress = 'mocked-address';
const mockedEnableMethod = jest.fn(() => [mockedAddress]);

describe('Metamask` Wallet Module', () => {
  beforeEach(() => {
    testGlobal.ethereum = {
      enable: mockedEnableMethod,
    };
  });
  afterEach(() => {
    MockedWeb3.mockClear();
    mockedWarning.mockClear();
    mockedEnableMethod.mockClear();
  });
  describe('`open()` static method', () => {
    test('Start in EIP-1102 mode', async () => {
      await open();
      /*
       * Enabled the account
       */
      expect(mockedEnableMethod).toHaveBeenCalled();
      /*
       * Created the Web3 Instance
       */
      expect(MockedWeb3).toHaveBeenCalled();
      expect(MockedWeb3).toHaveBeenCalledWith(testGlobal.ethereum);
      /*
       * We did not warn the user, we're not in legacy mode
       */
      expect(warning).not.toHaveBeenCalled();
    });
    test('Start in Legacy mode', async () => {
      testGlobal.ethereum = undefined;
      testGlobal.web3 = {
        currentProvider: {
          enable: mockedEnableMethod,
        },
      };
      await open();
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
      expect(MockedWeb3).toHaveBeenCalled();
      /*
       * Call the helper method
       */
    });
    test('Detect the inpage provider before opening', async () => {
      await open();
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
    });
    test("Get the address from Metamask's state (legacy)", async () => {
      await open();
      /*
       * Call the helper method
       */
      expect(getInpageProvider).toHaveBeenCalled();
    });
    test('Open the wallet with defaults', async () => {
      await open();
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
      /*
       * Instantiates the Metamask class
       */
      expect(MetaMaskWallet).toHaveBeenCalled();
      expect(MetaMaskWallet).toHaveBeenCalledWith({
        address: mockedAddress,
      });
    });
  });
});
