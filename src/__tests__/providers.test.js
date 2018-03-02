import { providers as ethersProviders } from 'ethers';

import providers, {
  etherscan,
  infura,
  metamask,
  localhost,
  autoselect,
} from '../providers';
import {
  DEFAULT_NETWORK,
  LOCALPROVIDER_HOST as HOST,
  LOCALPROVIDER_PORT as PORT,
  LOCALPROVIDER_PROTOCOL as PROTOCOL,
} from '../defaults';
import * as utils from '../utils';

jest.mock('../utils');

describe('`providers` module', () => {
  beforeEach(() => {
    utils.warn.mockReset();
  });
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
      expect(provider).toEqual(providers.providerPrototype);
    });
  });
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
      expect(provider).toEqual(providers.providerPrototype);
    });
  });
  describe('`metamask/web3` provider', () => {
    test('Connects with defaults', () => {
      global.web3 = { currentProvider: { mockProvider: true } };
      ethersProviders.Web3Provider = jest.fn();
      metamask();
      expect(ethersProviders.Web3Provider).toHaveBeenCalled();
      expect(ethersProviders.Web3Provider).toHaveBeenCalledWith(
        global.web3.currentProvider,
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom network', () => {
      global.web3 = { currentProvider: { mockProvider: true } };
      ethersProviders.Web3Provider = jest.fn();
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
      ethersProviders.Web3Provider = jest.fn();
      const provider = metamask();
      expect(ethersProviders.Web3Provider).not.toHaveBeenCalled();
      expect(utils.warn).toHaveBeenCalled();
      expect(provider).toEqual(providers.providerPrototype);
    });
    test('Catch the connection error if something goes wrong', () => {
      global.web3 = { currentProvider: { mockProvider: true } };
      ethersProviders.Web3Provider = jest.fn(() => {
        throw new Error();
      });
      const testNetworkName = 'network-name-does-not-exist';
      const provider = metamask(testNetworkName);
      expect(ethersProviders.Web3Provider).toHaveBeenCalled();
      expect(ethersProviders.Web3Provider).toThrow();
      expect(provider).toEqual(providers.providerPrototype);
    });
  });
  describe('`localhost` provider', () => {
    test('Connects with defaults', () => {
      ethersProviders.JsonRpcProvider = jest.fn();
      localhost();
      expect(ethersProviders.JsonRpcProvider).toHaveBeenCalled();
      expect(ethersProviders.JsonRpcProvider).toHaveBeenCalledWith(
        `${PROTOCOL}://${HOST}:${PORT}`,
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom url and network', () => {
      ethersProviders.JsonRpcProvider = jest.fn();
      const testUrl = 'http://127.0.0.1';
      const testNetworkName = 'skynet';
      localhost(testUrl, testNetworkName);
      expect(ethersProviders.JsonRpcProvider).toHaveBeenCalled();
      expect(ethersProviders.JsonRpcProvider).toHaveBeenCalledWith(
        testUrl,
        testNetworkName,
      );
    });
    test('Catch the connection error if something goes wrong', () => {
      ethersProviders.JsonRpcProvider = jest.fn(() => {
        throw new Error();
      });
      const testNetworkName = 'network-name-does-not-exist';
      const provider = localhost(testNetworkName);
      expect(ethersProviders.JsonRpcProvider).toHaveBeenCalled();
      expect(ethersProviders.JsonRpcProvider).toThrow();
      expect(provider).toEqual(providers.providerPrototype);
    });
  });
  describe('autoselect providers from a list', () => {
    test('Try to connect to function providers', () => {
      const mockedProvider1 = jest.fn();
      const mockedProvider2 = jest.fn();
      autoselect([mockedProvider1, mockedProvider2]);
      expect(mockedProvider1).toHaveBeenCalled();
      expect(mockedProvider2).toHaveBeenCalled();
    });
    test('Try to connect to object providers', () => {
      const mockedProvider1 = { chainId: 1 };
      const mockedProvider2 = jest.fn();
      const mockedProvider3 = { chainId: 3 };
      const provider = autoselect([
        mockedProvider1,
        mockedProvider2,
        mockedProvider3,
      ]);
      expect(provider).toEqual(mockedProvider1);
    });
    test('Show an error if the providers array is empty', () => {
      utils.error = jest.fn();
      const provider = autoselect([]);
      expect(utils.error).toHaveBeenCalled();
      expect(provider).toEqual(providers.providerPrototype);
    });
    test('Show an error if it could not connect to any providers', () => {
      utils.error = jest.fn();
      const provider = autoselect([{ chainId: false }, {}, () => {}]);
      expect(utils.error).toHaveBeenCalled();
      expect(provider).toEqual(providers.providerPrototype);
    });
  });
});
