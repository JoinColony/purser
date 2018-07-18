/* @flow */

import { PATH, SPLITTER, MATCH } from './defaults';

/*
 * @TODO Make normalizers core methods
 *
 * As with validators, these will most likely be used across all wallet types, so it will
 * make sense that as some point they will become core normalizers.
 */

/**
 * Normalize a derivation path passed in as a string
 *
 * This method assumes the derivation path is already validatated and is in a correct format.
 * Use `derivationPathValidator` from `validators` to achieve that.
 *
 * @method derivationPathNormalizer
 *
 * @param {string} derivationPath The derivation path to normalize
 *
 * @return {string} The normalized derivation path
 */
export const derivationPathNormalizer = (derivationPath: string): string => {
  const deSerializedDerivationPath: Array<string> = derivationPath.split(
    PATH.DELIMITER,
  );
  return deSerializedDerivationPath
    .map((pathSection, index) => {
      switch (index) {
        /*
         * Normalize the header key (letter "m")
         */
        case 0: {
          const deviationPathHeader = pathSection.split(SPLITTER);
          return [
            deviationPathHeader[0].toLowerCase(),
            /*
             * The purpose doesn't need to be normalized, since we check for the exact value (44)
             * inside the validator
             */
            deviationPathHeader[1],
          ].join(SPLITTER);
        }
        /*
         * Normalize the Coin type id and the account (they both normalize the same)
         */
        /* eslint-disable-next-line no-fallthrough */
        case 1:
        case 2: {
          return parseInt(pathSection, 10).toString();
        }
        case 3: {
          const deviationPathChageIndex = pathSection.split(SPLITTER);
          /*
           * Every combination of digits delimited by a slash pass the validator,
           * Eg: `0/0`, `0/0/0`, `0/0/0/0`
           *
           * So we just takes the first two values;
           */
          return deviationPathChageIndex
            .map(value => parseInt(value, 10))
            .slice(0, 2)
            .join(SPLITTER);
        }
        default: {
          return pathSection;
        }
      }
    })
    .join(PATH.DELIMITER);
};

/**
 * Normalize a hex string to have the length of multiple of two.
 * Eg: '3' to be '03', `12c` to be `012c`
 *
 * This is only needed currently for Trezor's service
 *
 * This method assumes the value path is already validatated.
 *
 * @method multipleOfTwoHexValueNormalizer
 *
 * @param {string} hexValue The hex value to normalize
 *
 * @return {string} The normalized (padded) hex path
 */
export const multipleOfTwoHexValueNormalizer = (hexValue: string): string =>
  String(hexValue).padStart(Math.ceil(hexValue.length / 2) * 2, '0');

/**
 * Nomalize an ethereum address
 *
 * This method assumes the address is already validatated and is in the correct format.
 *
 * @method addressNormalizer
 *
 * @param {string} adddress The address to normalize
 * @param {boolean} prefix Should the final value have a prefix?
 *
 * @return {string} The normalized string
 */
export const addressNormalizer = (
  adddress: string | void,
  prefix: boolean = true,
): string => {
  /*
   * Index 1 is the prefix (if it exists), index 2 is the address without a prefix
   *
   * Flow doesn't trust that we are actually capable of validating a string
   */
  /* $FlowFixMe */
  const matchedAddress: Array<*> = adddress.match(MATCH.ADDRESS);
  if (prefix) {
    return `0x${matchedAddress[2]}`;
  }
  return matchedAddress[2];
};

/**
 * Nomalize a hex string sequence.
 *
 * Transforms it to lower case, and, depending on the prefix argument,
 * either add it (`0x`) or remove it
 *
 * This method assumes the address is already validatated and is in the correct format.
 *
 * @method hexSequenceNormalizer
 *
 * @param {string} hexString The hex string sequence to normalize
 * @param {boolean} prefix Should the final value have a prefix?
 *
 * @return {string} The normalized string
 */
export const hexSequenceNormalizer = (
  hexString: string | void,
  prefix: boolean = true,
): string => {
  /*
  * Flow doesn't trust that we are actually capable of validating a string
  */
  /* $FlowFixMe */
  const lowecaseSequence = hexString.toLowerCase();
  /*
   * Index 1 is the prefix (if it exists), index 2 is the rest of the string sequence
   */
  /* $FlowFixMe */
  const matchedString: Array<*> = lowecaseSequence.match(MATCH.HEX_STRING);
  if (prefix) {
    return `0x${matchedString[2]}`;
  }
  return matchedString[2];
};
