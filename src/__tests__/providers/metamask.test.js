import ethersProviders from 'ethers/providers';

import { metamask } from '../../providers';
import { MAIN_NETWORK, PROVIDER_PROTO } from '../../defaults';
import * as utils from '../../core/utils';

jest.mock('ethers/providers');
/*
 * Manual mocking a manual mock. Yay for Jest being build by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../core/utils', () =>
  /* eslint-disable-next-line global-require */
  require('../../core/__mocks-required__/utils'),
);

describe('`providers` module', () => {
  beforeEach(() => {
    global.web3 = { currentProvider: { mockProvider: true } };
  });
  afterEach(() => {
    ethersProviders.Web3Provider.mockClear();
  });
  describe('`metamask/web3` provider', () => {
    test('Connects with defaults', async () => {
      await metamask();
      expect(ethersProviders.Web3Provider).toHaveBeenCalled();
      expect(ethersProviders.Web3Provider).toHaveBeenCalledWith(
        global.web3.currentProvider,
        MAIN_NETWORK,
      );
    });
    test('Connects with custom network', async () => {
      const testNetworkName = 'skynet';
      await metamask({ network: testNetworkName });
      expect(ethersProviders.Web3Provider).toHaveBeenCalled();
      expect(ethersProviders.Web3Provider).toHaveBeenCalledWith(
        global.web3.currentProvider,
        testNetworkName,
      );
    });
    /*
     * For some reason prettier always suggests a way to fix this that would
     * violate the 80 max-len rule. Wierd
     */
    /* eslint-disable prettier/prettier */
    test(
      'Detects if the metamask in-page provider is not available',
      async () => {
        global.web3 = undefined;
        const provider = await metamask({ network: 'not-called' });
        expect(ethersProviders.Web3Provider).not.toHaveBeenCalled();
        expect(utils.warning).toHaveBeenCalled();
        expect(provider).toEqual(PROVIDER_PROTO);
      },
    );
    /* eslint-enable prettier/prettier */
    test('Catch the connection error if something goes wrong', async () => {
      const testNetworkName = 'error';
      const provider = await metamask({ network: testNetworkName });
      expect(ethersProviders.Web3Provider).toHaveBeenCalled();
      expect(() =>
        ethersProviders.Web3Provider(
          global.web3.currentProvider,
          testNetworkName,
        ),
      ).toThrow();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
