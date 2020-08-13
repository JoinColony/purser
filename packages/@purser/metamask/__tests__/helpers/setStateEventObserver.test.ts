import * as helpers from '../../src/helpers';
import { testGlobal } from '../../../testutils';

const { setStateEventObserver } = helpers;

describe('Metamask` Wallet Module', () => {
  describe('`setStateEventObserver()` helper method with new ethereum provider api', () => {
    beforeAll(() => {
      testGlobal.ethereum = {
        on: jest.fn(),
      };
    });
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
