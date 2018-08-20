import * as helpers from '../../../metamask/helpers';

jest.dontMock('../../../metamask/helpers');

/*
 * We just need this method mocked, but since it's declared in a module we
 * need to test we have do do this little go-around trick and use the default export
 *
 * See: https://github.com/facebook/jest/issues/936
 */
helpers.default.getInpageProvider = jest.fn(() => global.web3.currentProvider);

const { setStateEventObserver } = helpers;

/*
 * Mock the global injected inpage provider
 */
global.web3 = {
  currentProvider: {
    publicConfigStore: {
      _events: {
        update: [],
      },
    },
  },
};

describe('Metamask` Wallet Module', () => {
  describe('`setStateEventObserver()` helper method', () => {
    afterEach(() => {
      helpers.default.getInpageProvider.mockClear();
      /*
       * Also reset the state event updates array
       */
      const {
        publicConfigStore: { _events: stateEvents },
      } = helpers.default.getInpageProvider();
      stateEvents.update = [];
    });
    test('Uses `getInpageProvider` to get the state events Array', async () => {
      setStateEventObserver();
      expect(helpers.default.getInpageProvider).toHaveBeenCalled();
    });
    test('Adds the observer callback to the state events Array', async () => {
      const {
        publicConfigStore: { _events: stateEvents },
      } = helpers.default.getInpageProvider();
      expect(stateEvents.update).toHaveLength(0);
      setStateEventObserver(() => {});
      expect(stateEvents.update).toHaveLength(1);
    });
  });
});
