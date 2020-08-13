import { detect } from '../src/index';
import { detect as detectHelper } from '../src/helpers';

jest.mock('../src/helpers');

describe('Metamask` Wallet Module', () => {
  describe('`detect()` static method', () => {
    test('Calls the correct helper method', async () => {
      await detect();
      /*
       * Call the helper method
       */
      expect(detectHelper).toHaveBeenCalled();
    });
  });
});
