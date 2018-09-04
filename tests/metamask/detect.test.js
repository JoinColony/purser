import metamaskWallet from '../../metamask';
import { detect as detectHelper } from '../../metamask/helpers';

jest.dontMock('../../metamask/index');

/*
 * Manual mocking a manual mock. Yay for Jest being built by Facebook!
 *
 * If you need context, see this:
 * https://github.com/facebook/jest/issues/2070
 */
jest.mock('../../metamask/helpers', () =>
  /* eslint-disable-next-line global-require */
  require('../../metamask/__remocks__/helpers'),
);

describe('Metamask` Wallet Module', () => {
  describe('`detect()` static method', () => {
    test('Calls the correct helper method', async () => {
      await metamaskWallet.detect();
      /*
       * Call the helper method
       */
      expect(detectHelper).toHaveBeenCalled();
    });
  });
});
