import metamaskWallet from '@colony/purser-metamask';
import {
  detect as detectHelper,
  setStateEventObserver,
} from '@colony/purser-metamask/helpers';

jest.dontMock('@colony/purser-metamask');

/*
 * @TODO Fix manual mocks
 * This is needed since Jest won't see our manual mocks (because of our custom monorepo structure)
 * and will replace them with automatic ones
 */
jest.mock('@colony/purser-metamask/helpers', () =>
  require('@mocks/purser-metamask/helpers'),
);

/*
 * Mock the global injected inpage provider
 */
global.web3 = {
  currentProvider: {
    _publicConfigStore: {
      _events: {
        update: [],
      },
    },
  },
};

const mockedCallback = jest.fn(state => state);

describe('Metamask` Wallet Module', () => {
  describe('`accountChangeHook()` static method', () => {
    test('Calls the correct helper method', async () => {
      await metamaskWallet.accountChangeHook();
      /*
       * Call the helper method
       */
      expect(setStateEventObserver).toHaveBeenCalled();
    });
    test('Detects if Metamask is available', async () => {
      await metamaskWallet.accountChangeHook();
      /*
       * Calls the `detect()` helper
       */
      expect(detectHelper).toHaveBeenCalled();
    });
    test('Adds a callback to the state observer', async () => {
      await metamaskWallet.accountChangeHook(mockedCallback);
      expect(
        /* eslint-disable-next-line no-underscore-dangle */
        global.web3.currentProvider._publicConfigStore._events.update,
      ).toContain(mockedCallback);
    });
    test('Catches if something goes wrong', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error along the way
       */
      setStateEventObserver.mockRejectedValueOnce(new Error());
      expect(metamaskWallet.accountChangeHook()).rejects.toThrow();
    });
  });
});
