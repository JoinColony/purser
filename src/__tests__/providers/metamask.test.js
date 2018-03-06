import ethersProviders from 'ethers/providers';

import { metamask } from '../../providers';
import { DEFAULT_NETWORK, PROVIDER_PROTO } from '../../defaults';
import * as utils from '../../utils';

jest.mock('../../utils');

describe('`providers` module', () => {
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
      expect(provider).toEqual(PROVIDER_PROTO);
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
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
