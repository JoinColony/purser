import { providers } from 'ethers';

import { etherscan, infura, metamask } from '../providers';
import { DEFAULT_NETWORK } from '../defaults';
import * as utils from '../utils';

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
  describe('`metamask/web3` provider', () => {
    test('Connects with defaults', () => {
      global.web3 = { currentProvider: { mockProvider: true } };
      providers.Web3Provider = jest.fn();
      metamask();
      expect(providers.Web3Provider).toHaveBeenCalled();
      expect(providers.Web3Provider).toHaveBeenCalledWith(
        global.web3.currentProvider,
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom network', () => {
      global.web3 = { currentProvider: { mockProvider: true } };
      providers.Web3Provider = jest.fn();
      const testNetworkName = 'skynet';
      metamask(testNetworkName);
      expect(providers.Web3Provider).toHaveBeenCalled();
      expect(providers.Web3Provider).toHaveBeenCalledWith(
        global.web3.currentProvider,
        testNetworkName,
      );
    });
    test('Detects if the metamask in-page provider is not available', () => {
      global.web3 = undefined;
      providers.Web3Provider = jest.fn();
      utils.warn = jest.fn();
      const provider = metamask();
      expect(providers.Web3Provider).not.toHaveBeenCalled();
      expect(utils.warn).toHaveBeenCalled();
      expect(provider).toEqual({});
    });
    test('Catch the connection error if something goes wrong', () => {
      global.web3 = { currentProvider: { mockProvider: true } };
      providers.Web3Provider = jest.fn(() => {
        throw new Error();
      });
      const testNetworkName = 'network-name-does-not-exist';
      const provider = metamask(testNetworkName);
      expect(providers.Web3Provider).toHaveBeenCalled();
      expect(providers.Web3Provider).toThrow();
      expect(provider).toEqual({});
    });
  });
});
