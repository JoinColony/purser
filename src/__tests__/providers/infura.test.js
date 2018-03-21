import ethersProviders from 'ethers/providers';

import { infura } from '../../providers';
import { DEFAULT_NETWORK, PROVIDER_PROTO } from '../../defaults';

jest.mock('ethers/providers');

describe('`providers` module', () => {
  afterEach(() => {
    ethersProviders.InfuraProvider.mockClear();
  });
  describe('`infura` provider', () => {
    test('Connects with defaults', () => {
      infura();
      expect(ethersProviders.InfuraProvider).toHaveBeenCalled();
      expect(ethersProviders.InfuraProvider).toHaveBeenCalledWith(
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom network and api key', () => {
      const testNetworkName = 'skynet';
      const testApiKey = '159346284575888';
      infura(testNetworkName, testApiKey);
      expect(ethersProviders.InfuraProvider).toHaveBeenCalled();
      expect(ethersProviders.InfuraProvider).toHaveBeenCalledWith(
        testNetworkName,
        testApiKey,
      );
    });
    test('Catch the connection error if something goes wrong', () => {
      const testNetworkName = 'error';
      const provider = infura(testNetworkName);
      expect(ethersProviders.InfuraProvider).toHaveBeenCalled();
      expect(() => ethersProviders.InfuraProvider(testNetworkName)).toThrow();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
