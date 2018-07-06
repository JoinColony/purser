/* @flow */

import { PATH } from './defaults';

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
 * @param {string} derivationPath The derivation path to check
 *
 * @return {string} The normalized derivation path
 */
export const derivationPathNormalizer = (derivationPath: string): string => {
  const SPLITTER = '/';
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

const normalizers = {
  derivationPathNormalizer,
};

export default normalizers;
