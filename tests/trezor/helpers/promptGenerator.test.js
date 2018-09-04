import { promptGenerator } from '../../../trezor/helpers';

jest.dontMock('../../../trezor/helpers');

/*
 * We need to mock the `window`'s `open()` global method
 */
window.open = jest.fn();

describe('`Trezor` Hardware Wallet Module Helpers', () => {
  describe('`promptGenerator()` helper', () => {
    test('Creates a new `window` instance', () => {
      const serviceUrl = 'mocked-url';
      const windowFeatures = 'mocked-window-features';
      promptGenerator({
        serviceUrl,
        windowFeatures,
      });
      expect(window.open).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(
        serviceUrl,
        /*
         * We don't care about the window's instance name
         */
        expect.anything(),
        windowFeatures,
      );
    });
  });
});
