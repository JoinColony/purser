import * as helpers from '@colony/purser-metamask/helpers';

jest.dontMock('@colony/purser-metamask/helpers');

/*
 * We just need this method mocked, but since it's declared in a module we
 * need to test we have do do this little go-around trick and use the default export
 *
 * See: https://github.com/facebook/jest/issues/936
 */
helpers.default.detect = jest.fn(() => true);

const { getInpageProvider } = helpers;

/*
 * Mock the global injected inpage provider
 */
const mockedEthereumProvider = 'mocked-ethereum-provider';
const mockedWeb3Provider = 'mocked-web3-provider';
global.ethereum = mockedEthereumProvider;
global.web3 = {
  currentProvider: mockedWeb3Provider,
};

describe('Metamask` Wallet Module', () => {
  describe('`getInpageProvider()` helper method', () => {
    afterEach(() => {
      helpers.default.detect.mockClear();
    });
    test('Returns the Web3 inpage provider', async () => {
      const modernProvider = getInpageProvider();
      expect(modernProvider).toEqual(mockedEthereumProvider);
    });
    test('Returns the `legacy` inpage provider', async () => {
      /*
       * @NOTE If there's no `global.ethereun` object, fall back to the legacy web3 provider
       */
      delete global.ethereum;
      const legacyProvider = getInpageProvider();
      expect(legacyProvider).toEqual(mockedWeb3Provider);
    });
  });
});
