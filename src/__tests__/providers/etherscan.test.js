import ethersProviders from 'ethers/providers';

import { etherscan } from '../../providers';
import { DEFAULT_NETWORK, PROVIDER_PROTO } from '../../defaults';

jest.mock('ethers/providers');

describe('`providers` module', () => {
  afterEach(() => {
    ethersProviders.EtherscanProvider.mockClear();
  });
  describe('`etherscan` provider', () => {
    test('Connects with defaults', async () => {
      await etherscan();
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalled();
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalledWith(
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom network and api key', async () => {
      const testNetworkName = 'skynet';
      const testApiKey = '159346284575888';
      await etherscan({
        network: testNetworkName,
        apiKey: testApiKey,
      });
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalled();
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalledWith(
        testNetworkName,
        testApiKey,
      );
    });
    test('Catch the connection error if something goes wrong', async () => {
      const testNetworkName = 'error';
      const provider = await etherscan({ network: testNetworkName });
      expect(ethersProviders.EtherscanProvider).toHaveBeenCalled();
      expect(() =>
        ethersProviders.EtherscanProvider(testNetworkName),
      ).toThrow();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
