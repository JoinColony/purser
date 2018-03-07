import ethersProviders from 'ethers/providers';

import { localhost } from '../../providers';
import {
  DEFAULT_NETWORK,
  LOCALPROVIDER_HOST as HOST,
  LOCALPROVIDER_PORT as PORT,
  LOCALPROVIDER_PROTOCOL as PROTOCOL,
  PROVIDER_PROTO,
} from '../../defaults';

jest.mock('ethers/providers');

describe('`providers` module', () => {
  afterEach(() => {
    ethersProviders.JsonRpcProvider.mockClear();
  });
  describe('`localhost` provider', () => {
    test('Connects with defaults', () => {
      localhost();
      expect(ethersProviders.JsonRpcProvider).toHaveBeenCalled();
      expect(ethersProviders.JsonRpcProvider).toHaveBeenCalledWith(
        `${PROTOCOL}://${HOST}:${PORT}`,
        DEFAULT_NETWORK,
      );
    });
    test('Connects with custom url and network', () => {
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
      const testNetworkName = 'error';
      const provider = localhost(testNetworkName);
      expect(ethersProviders.JsonRpcProvider).toHaveBeenCalled();
      expect(() => ethersProviders.JsonRpcProvider(testNetworkName)).toThrow();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
