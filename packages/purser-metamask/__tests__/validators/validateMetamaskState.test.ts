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
      // @ts-ignore
      expect(() => validateMetaMaskState(1)).toThrow(
        new Error(messages.noState),
      );
    });
    test('Checks that the object has the address prop', async () => {
      expect(() =>
        // @ts-ignore
        validateMetaMaskState({
          networkVersion: mockedNetworkVersion,
        }),
      ).toThrow();
      // @ts-ignore
      expect(() => validateMetaMaskState([])).toThrow(
        new Error(messages.noStateAddress),
      );
    });
    test('Checks that the object has the chain id prop', async () => {
      expect(() =>
        // @ts-ignore
        validateMetaMaskState({
          selectedAddress: mockedSelectedAddress,
        }),
      ).toThrow();
      expect(() =>
        // @ts-ignore
        validateMetaMaskState({
          selectedAddress: mockedSelectedAddress,
        }),
      ).toThrow(new Error(messages.noStateNetwork));
    });
    test('Returns otherwise if everyhting is good', async () => {
      // We only check for what we really need here
      // @ts-ignore
      const isStateValid = validateMetaMaskState(mockedStateObject);
      // @ts-ignore
      expect(() => validateMetaMaskState(mockedStateObject)).not.toThrow();
      expect(isStateValid).toBeTruthy();
    });
  });
});
