import { serviceUrlGenerator } from '@colony/purser-trezor/helpers';

import {
  SERVICE_DOMAIN,
  SERVICE_VERSION,
  SERVICE_URL,
  SERVICE_KEY,
} from '@colony/purser-trezor/defaults';

jest.dontMock('@colony/purser-trezor/helpers');

const serviceUrlString = `${SERVICE_DOMAIN}/${SERVICE_VERSION}/${SERVICE_URL}`;
const serviceUrlParam = `?${SERVICE_KEY}=`;

describe('`Trezor` Hardware Wallet Module Helpers', () => {
  describe('`serviceUrlGenerator()` helper', () => {
    test('Generates the Trezor service url by default', () => {
      const trezorServiceUrl = serviceUrlGenerator();
      expect(trezorServiceUrl).toEqual(
        `${serviceUrlString}${serviceUrlParam}${0}`,
      );
    });
    test('Correctly replaces the service key value', () => {
      const currentTimeMs = new Date().getTime();
      const trezorServiceUrl = serviceUrlGenerator({ keyValue: currentTimeMs });
      expect(trezorServiceUrl).toEqual(
        `${serviceUrlString}${serviceUrlParam}${currentTimeMs}`,
      );
    });
  });
});
