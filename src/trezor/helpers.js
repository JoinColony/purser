/* @flow */

import {
  SERVICE_DOMAIN,
  SERVICE_VERSION,
  SERVICE_URL,
  SERVICE_KEY,
  PROMPT_OPTIONS,
} from './defaults';
import { HANDSHAKE } from './responses';

import type { PromptOptionsType, ServiceUrlType } from './flowtypes';

export const sanitizeUrl = (url: string[]): string => {
  if (typeof url === 'string') {
    return url.match(/^.+:\/\/[^‌​/]+/)[0];
  }
  /*
   * @TODO Add error message via warning
   */
  throw new Error('Url to be santized not in the correct format');
};

export const optionsSerializer = (optionsObject: PromptOptionsType): string =>
  Object.keys(optionsObject).reduce(
    (optionsString, option) =>
      `${optionsString}${option}=${
        /*
         * We're not coercing booleans to strings here, we're just writing 'no'
         * in place of false, inside a new string.
         *
         * Flow is overreacting...
         */
        /* $FlowFixMe */
        optionsObject[option] === false ? 'no' : optionsObject[option]
      },`,
    '',
  );

export const serviceUrlGenerator = ({
  domain = SERVICE_DOMAIN,
  version = SERVICE_VERSION,
  url = SERVICE_URL,
  key = SERVICE_KEY,
}: ServiceUrlType = {}): string =>
  `${domain}/${version}/${url}?${key}=${new Date().getTime()}`;

export const promptGenerator = ({
  serviceUrl = serviceUrlGenerator(),
  promptOptions = optionsSerializer(PROMPT_OPTIONS),
}: Object = {}): Object =>
  window.open(serviceUrl, 'trezor-service-connection', promptOptions);

export const payloadListener = async ({
  payload,
  origin: payloadOrigin = SERVICE_DOMAIN,
}: Object = {}): Promise<Object> =>
  /*
   * @TODO Handle the reject case
   *
   * This will most likely happen due to
   */
  new Promise(resolve => {
    const prompt = promptGenerator();
    const messageListener = event => {
      const { data, isTrusted, origin } = event;
      const sameOrigin =
        prompt && sanitizeUrl(payloadOrigin) === sanitizeUrl(origin);
      if (isTrusted && sameOrigin && data === HANDSHAKE) {
        prompt.postMessage(payload, payloadOrigin);
      }
      if (isTrusted && sameOrigin && data && data.success) {
        resolve(data);
        prompt.close();
        window.removeEventListener('message', messageListener);
      }
    };
    window.addEventListener('message', messageListener);
  });

const trezorClassHelper: Object = {
  sanitizeUrl,
  optionsSerializer,
  promptGenerator,
  payloadListener,
};

export default trezorClassHelper;
