/* @flow */

import { padLeft } from '../utils';

import { PATH, SPLITTER } from './defaults';

/*
 * @TODO Make normalizers core methods
 *
 * As with validators, these will most likely be used across all wallet types, so it will
 * make sense that as some point they will become core normalizers.
 */

/**
 * Normalize a derivation path passed in as a string
 *
 * This method assumes the deripation path is already validatated and is in a correct format.
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
  padLeft({
    value: hexValue,
    length: Math.ceil(hexValue.length / 2) * 2,
    character: '0',
  });

const normalizers = {
  derivationPathNormalizer,
};

export default normalizers;
