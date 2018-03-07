import ethersProviders from 'ethers/providers';

import { metamask } from '../../providers';
import { DEFAULT_NETWORK, PROVIDER_PROTO } from '../../defaults';
import * as utils from '../../utils';

jest.mock('../../utils');
jest.mock('ethers/providers');

describe('`providers` module', () => {
  beforeEach(() => {
    global.web3 = { currentProvider: { mockProvider: true } };
  });
  afterEach(() => {
    ethersProviders.Web3Provider.mockClear();
  });
  describe('`metamask/web3` provider', () => {
    test('Connects with defaults', () => {
      metamask();
      expect(ethersProviders.Web3Provider).toHaveBeenCalled();
      expect(ethersProviders.Web3Provider).toHaveBeenCalledWith(
        global.web3.currentProvider,
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom network', () => {
      const testNetworkName = 'skynet';
      metamask(testNetworkName);
      expect(ethersProviders.Web3Provider).toHaveBeenCalled();
      expect(ethersProviders.Web3Provider).toHaveBeenCalledWith(
        global.web3.currentProvider,
        testNetworkName,
      );
    });
    test('Detects if the metamask in-page provider is not available', () => {
      global.web3 = undefined;
      const provider = metamask('not-called');
      expect(ethersProviders.Web3Provider).not.toHaveBeenCalled();
      expect(utils.warn).toHaveBeenCalled();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
    test('Catch the connection error if something goes wrong', () => {
      const testNetworkName = 'error';
      const provider = metamask(testNetworkName);
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
