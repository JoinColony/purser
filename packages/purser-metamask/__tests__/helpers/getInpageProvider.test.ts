import * as helpers from '../../src/helpers';
import { testGlobal } from '../../../testutils';

const mockDetect = jest
  .spyOn(helpers, 'detect')
  .mockImplementation(() => Promise.resolve(true));

const { getInpageProvider } = helpers;

/*
 * Mock the global injected inpage provider
 */
const mockedEthereumProvider = 'mocked-ethereum-provider';
const mockedWeb3Provider = 'mocked-web3-provider';
testGlobal.ethereum = mockedEthereumProvider;
testGlobal.web3 = {
  currentProvider: mockedWeb3Provider,
};

describe('Metamask` Wallet Module', () => {
  describe('`getInpageProvider()` helper method', () => {
    afterEach(() => {
      mockDetect.mockClear();
    });
    test('Returns the Web3 inpage provider', async () => {
      const modernProvider = getInpageProvider();
      expect(modernProvider).toEqual(mockedEthereumProvider);
    });
    test('Returns the `legacy` inpage provider', async () => {
      /*
       * @NOTE If there's no `global.ethereun` object, fall back to the legacy web3 provider
       */
      delete testGlobal.ethereum;
      const legacyProvider = getInpageProvider();
      expect(legacyProvider).toEqual(mockedWeb3Provider);
    });
  });
});
