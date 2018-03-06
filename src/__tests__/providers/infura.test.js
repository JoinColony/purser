import ethersProviders from 'ethers/providers';

import { infura } from '../../providers';
import { DEFAULT_NETWORK, PROVIDER_PROTO } from '../../defaults';

describe('`providers` module', () => {
  describe('`infura` provider', () => {
    test('Connects with defaults', () => {
      ethersProviders.InfuraProvider = jest.fn();
      infura();
      expect(ethersProviders.InfuraProvider).toHaveBeenCalled();
      expect(ethersProviders.InfuraProvider).toHaveBeenCalledWith(
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom network and api key', () => {
      ethersProviders.InfuraProvider = jest.fn();
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
      ethersProviders.InfuraProvider = jest.fn(() => {
        throw new Error();
      });
      const testNetworkName = 'network-name-does-not-exist';
      const provider = infura(testNetworkName);
      expect(ethersProviders.InfuraProvider).toHaveBeenCalled();
      expect(ethersProviders.InfuraProvider).toThrow();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
