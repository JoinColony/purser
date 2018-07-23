import { sanitizeUrl } from '../../../trezor/helpers';
import { messageValidator } from '../../../trezor/validators';

jest.dontMock('../../../trezor/helpers');

jest.mock('../../../trezor/validators');

const testUrl = 'http://some-url-location.com';
const malformedTestUrl = 'some-url-location.com';

describe('`Trezor` Hardware Wallet Module Helpers', () => {
  describe('`sanitizeUrl()` helper', () => {
    test('Should validate the url string as a message', () => {
      sanitizeUrl(testUrl);
      expect(messageValidator).toHaveBeenCalled();
      expect(messageValidator).toHaveBeenCalledWith(testUrl);
    });
    test('Should return the sanitized Url string', () => {
      const sanitizedUrl = sanitizeUrl(testUrl);
      expect(sanitizedUrl).toEqual(testUrl);
    });
    test('But should throw if the Url is not formatted properly', () => {
      expect(() => sanitizeUrl(malformedTestUrl)).toThrow();
    });
  });
});
