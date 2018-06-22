/* @flow */

import {
  SERVICE_DOMAIN,
  SERVICE_VERSION,
  SERVICE_URL,
  SERVICE_KEY,
  WINDOW_FEATURES,
  PATH,
} from './defaults';
import { RESPONSE_HANDSHAKE } from './responses';

import type {
  WindowFeaturesType,
  ServiceUrlType,
  PayloadListenerType,
  PayloadResponseType,
  DerivationPathObjectType,
} from './flowtypes';

/**
 * Ensure the url used to connect to the Trezor service is in the correct
 * format and doesn't contain any XSS shenanigans.
 *
 * @TODO Add error message via warning
 *
 * @method sanitizeUrl
 *
 * @param {string} url The url string to use
 *
 * @return {string} The correct url as determined by a regex pattern match
 */
export const sanitizeUrl = (url: string): string => {
  if (typeof url === 'string') {
    /*
     * Flow for some reason (well, there is one...) doesn't play well when matching
     * a string to a regex pattern.
     *
     * See this issue about that:
     * https://github.com/facebook/flow/issues/3554
     */
    /* $FlowFixMe */
    return url.match(/^.+:\/\/[^‌​/]+/)[0];
  }
  throw new Error('Url to be santized not in the correct format');
};

/**
 * Take a window features object and serialized into a string form, as this is the
 * expected format by the `windows`s `open()` interface.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/Window/open#Window_features for
 * more information about available features.
 *
 * @method windowFeaturesSerializer
 *
 * @param {Object} featuresObject A new window features object.
 * See `WindowFeaturesType` flow type for the expected format.
 *
 * @return {string} the features object serialized as a string
 */
export const windowFeaturesSerializer = (
  featuresObject: WindowFeaturesType,
): string =>
  Object.keys(featuresObject).reduce(
    (optionsString, option) =>
      `${optionsString}${option}=${
        /*
         * We're not coercing booleans to strings here, we're just writing 'no'
         * in place of false, inside a new string.
         *
         * Flow is overreacting...
         */
        /* $FlowFixMe */
        featuresObject[option] === false ? 'no' : featuresObject[option]
      },`,
    '',
  );

/**
 * Generate the Trezor service url from the provided (or default) values
 *
 * @method serviceUrlGenerator
 *
 * @param {string} domain Base service domain
 * @param {number} version Service version in use
 * @param {string} url service file path
 * @param {string} key the key to use when generating the message request
 *
 * All the above params are sent in as props of an {ServiceUrlType} object.
 *
 * @return {string} The generated service Url
 */
export const serviceUrlGenerator = ({
  domain = SERVICE_DOMAIN,
  version = SERVICE_VERSION,
  url = SERVICE_URL,
  key = SERVICE_KEY,
}: ServiceUrlType = {}): string =>
  `${domain}/${version}/${url}?${key}=${new Date().getTime()}`;

/**
 * Communications prompt (window) generator
 *
 * This method basically spawns a new window to the service url (using the provided
 * window features) to enable communication to the Trezor service.
 *
 * See more information about the Window API here:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window
 *
 * @TODO Add constant for the Window instance name
 *
 * @method promptGenerator
 *
 * @param {string} serviceUrl The Url to open the window to
 * @param {string} windowFeatures The window's features
 *
 * All the above params are sent in as props of an object.
 *
 * @return {Object} The new instance of the Window object (opened)
 */
export const promptGenerator = ({
  serviceUrl = serviceUrlGenerator(),
  windowFeatures = windowFeaturesSerializer(WINDOW_FEATURES),
}: Object = {}): Object =>
  window.open(serviceUrl, 'trezor-service-connection', windowFeatures);

/**
 * This method acomplishes fourt things: spawn an 'message' event listener,
 * send (POST) a message, listen for the response, cleanup the event listener.
 *
 * This is usefull to facilitate communication with the Trezor service.
 *
 * @TODO Handle the reject case
 * This will most likely happen due to erros in the handshake or the url being opened
 *
 * @TODO Create own response format
 * Basically remove un-needed props
 *
 * @TODO Allow users to choose the service url location / version
 *
 * @method payloadListener
 *
 * @param {Object} payload payload object to send to the Trezor service
 * (will be serialized in transit)
 * @param {string} origin The domain which handles the request
 *
 * All the above params are sent in as props of an {PayloadListenerType} object.
 *
 * @return {Promise<Object>} The new instance of the Window object (opened)
 */
export const payloadListener = async ({
  payload,
  origin: payloadOrigin = SERVICE_DOMAIN,
}: PayloadListenerType = {}): Promise<PayloadResponseType> =>
  new Promise(resolve => {
    const prompt = promptGenerator();
    const messageListener = event => {
      const { data, isTrusted, origin } = event;
      const sameOrigin =
        prompt && sanitizeUrl(payloadOrigin) === sanitizeUrl(origin);
      if (isTrusted && sameOrigin && data === RESPONSE_HANDSHAKE) {
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

/**
 * Serialize an derivation path object's props into it's string counterpart
 *
 * @TODO Check path values are of the correct (number) type
 *
 * @TODO there's an argument here that this should be moved into common defaults
 * and used through all of the wallet types for consistency.
 *
 * @method derivationPathSerializer
 *
 * @param {number} purpose path purpouse
 * @param {number} coinType path coin type (and network)
 * @param {number} account path account number
 * @param {number} change path change number
 * @param {number} addressIndex address index (no default since it should be manually added)
 *
 * See the defaults file for some more information regarding the format of the
 * ethereum deviation path.
 *
 * All the above params are sent in as props of an {DerivationPathObjectType} object.
 *
 * @return {string} The serialized path
 */
export const derivationPathSerializer = ({
  purpose = PATH.PURPOSE,
  coinType = PATH.COIN_MAINNET,
  account = PATH.ACCOUNT,
  change = PATH.CHANGE,
  addressIndex,
}: DerivationPathObjectType = {}): string =>
  `m/${purpose}'/${coinType}'/${account}'/${change}${
    addressIndex || addressIndex === 0 ? `/${addressIndex}` : ''
  }`;

const trezorClassHelper: Object = {
  sanitizeUrl,
  windowFeaturesSerializer,
  promptGenerator,
  payloadListener,
  derivationPathSerializer,
};

export default trezorClassHelper;
