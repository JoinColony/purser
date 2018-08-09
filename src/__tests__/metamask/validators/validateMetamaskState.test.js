import { validateMetamaskState } from '../../../metamask/validators';

import { validators as messages } from '../../../metamask/messages';

jest.dontMock('../../../metamask/validators');

// import { methodCaller, getInpageProvider } from '../../metamask/helpers';

/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../../metamask/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../../metamask/__remocks__/helpers'),
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
