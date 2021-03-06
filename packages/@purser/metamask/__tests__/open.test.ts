import { mocked } from 'ts-jest/utils';

import { warning } from '../../core/src/utils';
import { open } from '../src/index';
import MetaMaskWallet from '../src/MetaMaskWallet';
import { methodCaller } from '../src/helpers';
import { testGlobal } from '../../testutils';

jest.mock('../src/MetaMaskWallet');
jest.mock('../src/helpers');
jest.mock('../../core/src/utils');

const mockedWarning = mocked(warning);

/*
 * Mocked values
 */
const mockedAddress = 'mocked-address';
const mockedEnableMethod = jest.fn(async () => [mockedAddress]);

describe('Metamask` Wallet Module', () => {
  beforeEach(() => {
    testGlobal.ethereum = {
      request: mockedEnableMethod,
    };
  });
  afterEach(() => {
    mockedWarning.mockClear();
    mockedEnableMethod.mockClear();
  });
  describe('`open()` static method', () => {
    test('Request accounts', async () => {
      await open();
      /*
       * Enabled the account
       */
      expect(mockedEnableMethod).toHaveBeenCalled();
      /*
       * We did not warn the user, we're not in legacy mode
       */
      expect(warning).not.toHaveBeenCalled();
    });
    test('Detect the inpage provider before opening', async () => {
      await open();
      /*
       * Call the helper method
       */
      expect(methodCaller).toHaveBeenCalled();
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
