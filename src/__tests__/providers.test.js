import { providers } from 'ethers';

import { etherscan, infura } from '../providers';
import { DEFAULT_NETWORK } from '../defaults';

describe('`providers` module', () => {
  describe('`etherscan` provider', () => {
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
  describe('`infura` provider', () => {
    test('Connects with defaults', () => {
      providers.InfuraProvider = jest.fn();
      infura();
      expect(providers.InfuraProvider).toHaveBeenCalled();
      expect(providers.InfuraProvider).toHaveBeenCalledWith(DEFAULT_NETWORK);
    });
    test('Connects with custom network and api key', () => {
      providers.InfuraProvider = jest.fn();
      const testNetworkName = 'skynet';
      const testApiKey = '159346284575888';
      infura(testNetworkName, testApiKey);
      expect(providers.InfuraProvider).toHaveBeenCalled();
      expect(providers.InfuraProvider).toHaveBeenCalledWith(
        testNetworkName,
        testApiKey,
      );
    });
    test('Catch the connection error if something goes wrong', () => {
      providers.InfuraProvider = jest.fn(() => {
        throw new Error();
      });
      const testNetworkName = 'network-name-does-not-exist';
      const provider = infura(testNetworkName);
      expect(providers.InfuraProvider).toHaveBeenCalled();
      expect(providers.InfuraProvider).toThrow();
      expect(provider).toEqual({});
    });
  });
});
