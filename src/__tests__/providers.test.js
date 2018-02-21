import { providers } from 'ethers';

import { etherscan } from '../providers';
import { DEFAULT_NETWORK } from '../defaults';

describe('`providers` module', () => {
  describe('etherscan provider', () => {
    test('Connects with defaults', () => {
      providers.EtherscanProvider = jest.fn();
      etherscan();
      expect(providers.EtherscanProvider).toHaveBeenCalled();
      expect(providers.EtherscanProvider).toHaveBeenCalledWith(DEFAULT_NETWORK);
    });
    test('Connects with custom network and api key', () => {
      providers.EtherscanProvider = jest.fn();
      const testNetworkName = 'skynet';
      const testApiKey = '159346284575888';
      etherscan(testNetworkName, testApiKey);
      expect(providers.EtherscanProvider).toHaveBeenCalled();
      expect(providers.EtherscanProvider).toHaveBeenCalledWith(
        testNetworkName,
        testApiKey,
      );
    });
    test('Catch the connection error if something goes wrong', () => {
      providers.EtherscanProvider = jest.fn(() => {
        throw new Error();
      });
      const testNetworkName = 'network-name-does-not-exist';
      const provider = etherscan(testNetworkName);
      expect(providers.EtherscanProvider).toHaveBeenCalled();
      expect(providers.EtherscanProvider).toThrow();
      expect(provider).toEqual({});
    });
  });
});
