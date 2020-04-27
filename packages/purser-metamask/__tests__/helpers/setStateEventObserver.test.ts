import * as helpers from '../../src/helpers';
import { testGlobal } from '../../../testutils';

const { setStateEventObserver } = helpers;

const mockGetInpageProvider = jest.spyOn(helpers, 'getInpageProvider');

describe('Metamask` Wallet Module', () => {
  describe('`setStateEventObserver()` helper method with old ethereum provider api', () => {
    beforeAll(() => {
      /*
       * Mock the global injected in-page provider
       */
      testGlobal.web3 = {
        currentProvider: {
          publicConfigStore: {
            _events: {
              update: [],
            },
          },
        },
      };

      mockGetInpageProvider.mockImplementation(
        () => testGlobal.web3.currentProvider,
      );
    });
    afterEach(() => {
      mockGetInpageProvider.mockClear();
      /*
       * Also reset the state event updates array
       */
      const {
        publicConfigStore: { _events: stateEvents },
      } = helpers.getInpageProvider();
      stateEvents.update = [];
    });
    test('Uses `getInpageProvider` to get the state events Array', async () => {
      setStateEventObserver(jest.fn());
      expect(mockGetInpageProvider).toHaveBeenCalled();
    });
    test('Adds the observer callback to the state events Array', async () => {
      const {
        publicConfigStore: { _events: stateEvents },
      } = helpers.getInpageProvider();
      expect(stateEvents.update).toHaveLength(0);
      setStateEventObserver(jest.fn());
      expect(stateEvents.update).toHaveLength(1);
    });
  });

  describe('`setStateEventObserver()` helper method with new ethereum provider api', () => {
    beforeAll(() => {
      /*
       * Mock the ethereum provider with the new state change api
       */
      mockGetInpageProvider.mockImplementation(() => testGlobal.ethereum);
      testGlobal.ethereum = {
        on: jest.fn(),
        publicConfigStore: {
          _events: {
            update: [],
          },
        },
      };
    });
    afterEach(() => mockGetInpageProvider.mockClear());
    test('Utilises the new method of listening for events if available', async () => {
      /*
       * If ethereum.on is available we should be using that to listen for account state change
       * Attempt to listen for account changes
       */
      const myListener = jest.fn();
      setStateEventObserver(myListener);

      /*
       * Expect the new function was called with our listening function
       */
      expect(testGlobal.ethereum.on).toHaveBeenCalledTimes(1);
      expect(testGlobal.ethereum.on).toHaveBeenCalledWith(
        'accountsChanged',
        myListener,
      );
    });
  });
});
