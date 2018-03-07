import ethersProviders from 'ethers/providers';

import { etherscan } from '../../providers';
import { DEFAULT_NETWORK, PROVIDER_PROTO } from '../../defaults';

jest.mock('ethers/providers');

describe('`providers` module', () => {
  afterEach(() => {
    ethersProviders.EtherscanProvider.mockClear();
  });
  describe('`etherscan` provider', () => {
    test('Connects with defaults', () => {
      etherscan();
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalled();
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalledWith(
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom network and api key', () => {
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
      const testNetworkName = 'error';
      const provider = etherscan(testNetworkName);
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalled();
      expect(() =>
        ethersProviders.EtherscanProvider(testNetworkName),
      ).toThrow();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
