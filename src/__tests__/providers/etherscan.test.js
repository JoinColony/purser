import ethersProviders from 'ethers/providers';

import { etherscan } from '../../providers';
import { DEFAULT_NETWORK, PROVIDER_PROTO } from '../../defaults';

describe('`providers` module', () => {
  describe('`etherscan` provider', () => {
    test('Connects with defaults', () => {
      ethersProviders.EtherscanProvider = jest.fn();
      etherscan();
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalled();
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalledWith(
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom network and api key', () => {
      ethersProviders.EtherscanProvider = jest.fn();
      const testNetworkName = 'skynet';
      const testApiKey = '159346284575888';
      etherscan(testNetworkName, testApiKey);
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalled();
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalledWith(
        testNetworkName,
        testApiKey,
      );
    });
    test('Catch the connection error if something goes wrong', () => {
      ethersProviders.EtherscanProvider = jest.fn(() => {
        throw new Error();
      });
      const testNetworkName = 'network-name-does-not-exist';
      const provider = etherscan(testNetworkName);
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalled();
      expect(ethersProviders.EtherscanProvider).toThrow();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
