import ethersProviders from 'ethers/providers';

import { infura } from '../../providers';
import { MAIN_NETWORK, PROVIDER_PROTO } from '../../defaults';

jest.mock('ethers/providers');

describe('`providers` module', () => {
  afterEach(() => {
    ethersProviders.InfuraProvider.mockClear();
  });
  describe('`infura` provider', () => {
    test('Connects with defaults', async () => {
      await infura();
      expect(ethersProviders.InfuraProvider).toHaveBeenCalled();
      expect(ethersProviders.InfuraProvider).toHaveBeenCalledWith(MAIN_NETWORK);
    });
    test('Connects with custom network and api key', async () => {
      const testNetworkName = 'skynet';
      const testApiKey = '159346284575888';
      await infura({
        network: testNetworkName,
        apiKey: testApiKey,
      });
      expect(ethersProviders.InfuraProvider).toHaveBeenCalled();
      expect(ethersProviders.InfuraProvider).toHaveBeenCalledWith(
        testNetworkName,
        testApiKey,
      );
    });
    test('Catch the connection error if something goes wrong', async () => {
      const testNetworkName = 'error';
      const provider = await infura({ network: testNetworkName });
      expect(ethersProviders.InfuraProvider).toHaveBeenCalled();
      expect(() => ethersProviders.InfuraProvider(testNetworkName)).toThrow();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
