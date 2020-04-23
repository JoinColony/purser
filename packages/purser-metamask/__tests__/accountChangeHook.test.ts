import { accountChangeHook } from '../src/index';
import { detect as detectHelper, setStateEventObserver } from '../src/helpers';
import { jestMocked } from '../../testutils';

jest.mock('../src/helpers');

/*
 * Mock the global injected inpage provider
 */
const anyGlobal: any = global;

anyGlobal.web3 = {
  currentProvider: {
    publicConfigStore: {
      _events: {
        update: [],
      },
    },
  },
};

const mockedCallback = jest.fn((state) => state);
const mockedSetStateEventObserver = jestMocked(setStateEventObserver);

describe('Metamask` Wallet Module', () => {
  describe('`accountChangeHook()` static method', () => {
    test('Calls the correct helper method', async () => {
      await accountChangeHook(jest.fn());
      /*
       * Call the helper method
       */
      expect(mockedSetStateEventObserver).toHaveBeenCalled();
    });
    test('Detects if Metamask is available', async () => {
      await accountChangeHook(jest.fn());
      /*
       * Calls the `detect()` helper
       */
      expect(detectHelper).toHaveBeenCalled();
    });
    test('Adds a callback to the state observer', async () => {
      await accountChangeHook(mockedCallback);
      expect(
        /* eslint-disable-next-line no-underscore-dangle */
        anyGlobal.web3.currentProvider.publicConfigStore._events.update,
      ).toContain(mockedCallback);
    });
    test('Catches if something goes wrong', async () => {
      /*
       * We're re-mocking the helpers just for this test so we can simulate
       * an error along the way
       */
      mockedSetStateEventObserver.mockRejectedValueOnce(new Error());
      expect(accountChangeHook(jest.fn())).rejects.toThrow();
    });
  });
});
