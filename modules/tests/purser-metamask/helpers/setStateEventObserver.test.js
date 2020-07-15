import * as helpers from '@colony/purser-metamask/helpers';

jest.dontMock('@colony/purser-metamask/helpers');

const { setStateEventObserver } = helpers;

describe('Metamask` Wallet Module', () => {
  describe('`setStateEventObserver()` helper method with old ethereum provider api', () => {
    beforeAll(() => {
      /*
       * Mock the global injected in-page provider
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

      /*
       * We just need this method mocked, but since it's declared in a module we
       * need to test we have do do this little go-around trick and use the default export
       *
       * See: https://github.com/facebook/jest/issues/936
       */
      helpers.default.getInpageProvider = jest.fn(
        () => global.web3.currentProvider,
      );
    });
    afterEach(() => {
      helpers.default.getInpageProvider.mockClear();
      /*
       * Also reset the state event updates array
       */
      const {
        _publicConfigStore: { _events: stateEvents },
      } = helpers.default.getInpageProvider();
      stateEvents.update = [];
    });
    test('Uses `getInpageProvider` to get the state events Array', async () => {
      setStateEventObserver();
      expect(helpers.default.getInpageProvider).toHaveBeenCalled();
    });
    test('Adds the observer callback to the state events Array', async () => {
      const {
        _publicConfigStore: { _events: stateEvents },
      } = helpers.default.getInpageProvider();
      expect(stateEvents.update).toHaveLength(0);
      setStateEventObserver(() => {});
      expect(stateEvents.update).toHaveLength(1);
    });
  });

  describe('`setStateEventObserver()` helper method with new ethereum provider api', () => {
    beforeAll(() => {
      /*
       * Mock the ethereum provider with the new state change api
       */
      helpers.default.getInpageProvider = jest.fn(() => global.ethereum);
      global.ethereum = {
        on: jest.fn(() => {}),
      };
    });
    afterEach(() => helpers.default.getInpageProvider.mockClear());
    test('Utilises the new method of listening for events if available', async () => {
      /*
       * If ethereum.on is available we should be using that to listen for account state change
       * Attempt to listen for account changes
       */
      const myListener = () => {};
      setStateEventObserver(myListener);

      /*
       * Expect the new function was called with our listening function
       */
      expect(global.ethereum.on).toHaveBeenCalledTimes(1);
      expect(global.ethereum.on).toHaveBeenCalledWith(
        'accountsChanged',
        myListener,
      );
    });
  });
});
