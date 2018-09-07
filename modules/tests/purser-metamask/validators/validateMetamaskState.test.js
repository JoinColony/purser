import { validateMetamaskState } from '@colony/purser-metamask/validators';

import { validators as messages } from '@colony/purser-metamask/messages';

jest.dontMock('@colony/purser-metamask/validators');

/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-metamask/helpers', () =>
  require('@mocks/purser-metamask/helpers'),
);

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
  describe('`validateMetamaskState()` validator', () => {
    test('Checks the value to be an object', async () => {
      expect(() => validateMetamaskState()).toThrow();
      expect(() => validateMetamaskState(1)).toThrowError(
        new Error(messages.noState),
      );
    });
    test('Checks that the object has the address prop', async () => {
      expect(() =>
        validateMetamaskState({
          networkVersion: mockedNetworkVersion,
        }),
      ).toThrow();
      expect(() => validateMetamaskState([])).toThrowError(
        new Error(messages.noStateAddress),
      );
    });
    test('Checks that the object has the chain id prop', async () => {
      expect(() =>
        validateMetamaskState({
          selectedAddress: mockedSelectedAddress,
        }),
      ).toThrow();
      expect(() =>
        validateMetamaskState({
          selectedAddress: mockedSelectedAddress,
        }),
      ).toThrow(new Error(messages.noStateNetwork));
    });
    test('Returns otherwise if everyhting is good', async () => {
      const isStateValid = validateMetamaskState(mockedStateObject);
      expect(() => validateMetamaskState(mockedStateObject)).not.toThrow();
      expect(isStateValid).toBeTruthy();
    });
  });
});
