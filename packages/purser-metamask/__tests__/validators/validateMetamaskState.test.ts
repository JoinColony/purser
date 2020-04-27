import { validateMetaMaskState } from '../../src/validators';

import { validators as messages } from '../../src/messages';

jest.mock('../../src/helpers');

/*
 * Mocked values for testing
 */
const mockedSelectedAddress = 'mocked-selected-address';
const mockedNetworkVersion = 'mocked-chain-id';
const mockedStateObject = {
  selectedAddress: mockedSelectedAddress,
  networkVersion: mockedNetworkVersion,
};

describe('Metamask` Wallet Module', () => {
  describe('`validateMetaMaskState()` validator', () => {
    test('Checks the value to be an object', async () => {
      // @ts-ignore
      expect(() => validateMetaMaskState()).toThrow();
      expect(() => validateMetaMaskState(1)).toThrowError(
        new Error(messages.noState),
      );
    });
    test('Checks that the object has the address prop', async () => {
      expect(() =>
        validateMetaMaskState({
          networkVersion: mockedNetworkVersion,
        }),
      ).toThrow();
      expect(() => validateMetaMaskState([])).toThrowError(
        new Error(messages.noStateAddress),
      );
    });
    test('Checks that the object has the chain id prop', async () => {
      expect(() =>
        validateMetaMaskState({
          selectedAddress: mockedSelectedAddress,
        }),
      ).toThrow();
      expect(() =>
        validateMetaMaskState({
          selectedAddress: mockedSelectedAddress,
        }),
      ).toThrow(new Error(messages.noStateNetwork));
    });
    test('Returns otherwise if everyhting is good', async () => {
      const isStateValid = validateMetaMaskState(mockedStateObject);
      expect(() => validateMetaMaskState(mockedStateObject)).not.toThrow();
      expect(isStateValid).toBeTruthy();
    });
  });
});
