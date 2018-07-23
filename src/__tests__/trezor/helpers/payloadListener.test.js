import { payloadListener } from '../../../trezor/helpers';

import { SERVICE_DOMAIN } from '../../../trezor/defaults';

jest.dontMock('../../../trezor/helpers');

/*
 * We need to mock the `window`'s global event listeners methods
 */
const mockPostMessage = jest.fn();
const mockClose = jest.fn();
window.open = jest.fn(() => ({
  postMessage: mockPostMessage,
  close: mockClose,
}));

/*
 * Event listener mock helper, to cut down on code repetition, since we will
 * re-implement it quite a bit through this scenario.
 */
const eventListenerMockGenerator = ({
  data = null,
  isTrusted = true,
  origin = SERVICE_DOMAIN,
} = {}) => (name, listenerCallback) =>
  listenerCallback({
    data,
    isTrusted,
    origin,
  });
window.addEventListener = jest.fn(
  eventListenerMockGenerator({ isTrusted: false }),
);
window.removeEventListener = jest.fn();

const payload = 'moked-payload';
const reponseData = 'mocked-response-data';
const reponseError = 'mocked-response-error';

describe('`Trezor` Hardware Wallet Module Helpers', () => {
  afterEach(() => {
    window.addEventListener.mockReset();
    window.addEventListener.mockRestore();
    window.removeEventListener.mockReset();
    window.removeEventListener.mockRestore();
    mockPostMessage.mockReset();
    mockPostMessage.mockRestore();
    mockClose.mockReset();
    mockClose.mockRestore();
  });
  describe('`payloadListener()` helper', () => {
    test('Waits for the handshake', async () => {
      /*
       * Resolves to false, but does not throw
       */
      expect(payloadListener({ payload })).resolves.toBeFalsy();
      expect(payloadListener({ payload })).resolves.not.toThrow();
    });
    test('Responds to the handshake by sending the payload', async () => {
      /*
       * It's now trusted and has a handshake
       */
      window.addEventListener.mockImplementation(
        eventListenerMockGenerator({ data: 'handshake' }),
      );
      payloadListener({ payload });
      expect(mockPostMessage).toHaveBeenCalled();
      expect(mockPostMessage).toHaveBeenCalledWith(payload, SERVICE_DOMAIN);
    });
    test('Responds to the request successfully', async () => {
      /*
       * A successfull request, that gets back a response
       */
      window.addEventListener.mockImplementation(
        eventListenerMockGenerator({
          data: { success: true, value: reponseData },
        }),
      );
      const payloadRequest = payloadListener({ payload });
      /*
       * Closes the existing window
       */
      expect(mockClose).toHaveBeenCalled();
      /*
       * Stops the event listener
       */
      expect(window.removeEventListener).toHaveBeenCalled();
      /*
       * Returns the response data
       */
      expect(payloadRequest).resolves.toHaveProperty('value', reponseData);
    });
    test('Responds to the request with an error', async () => {
      /*
       * A bad request, that gets back a response and an Error
       */
      window.addEventListener.mockImplementation(
        eventListenerMockGenerator({
          data: { success: false, error: reponseError },
        }),
      );
      const payloadRequest = payloadListener({ payload });
      /*
       * Closes the existing window
       */
      expect(mockClose).toHaveBeenCalled();
      /*
       * Stops the event listener
       */
      expect(window.removeEventListener).toHaveBeenCalled();
      /*
       * Returns the response data
       */
      expect(payloadRequest).rejects.toThrow();
      expect(payloadRequest).rejects.toThrowError(reponseError);
    });
  });
});
