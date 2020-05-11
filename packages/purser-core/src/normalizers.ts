import { PATH, SPLITTER, MATCH, SIGNATURE } from './constants';

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
          return deviationPathChageIndex
            .map((value) => parseInt(value, 10))
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

const stringPrefixNormalizer = (
  pattern: RegExp,
  str: string,
  prefix = true,
): string => {
  /*
   * Index 1 is the prefix (if it exists), index 2 is the value without a prefix
   */
  const matchedAddress = str.match(pattern) || [];
  return prefix ? `0x${matchedAddress[2]}` : matchedAddress[2];
};

/**
 * Normalize an Ethereum address
 *
 * This method assumes the address is already validatated and is in the correct format.
 *
 * @method addressNormalizer
 *
 * @param {string} address The address to normalize
 * @param {boolean} prefix Should the final value have a prefix?
 *
 * @return {string} The normalized string
 */

export const addressNormalizer = (
  rawAddress: string,
  prefix?: boolean,
): string => stringPrefixNormalizer(MATCH.ADDRESS, rawAddress, prefix);

/**
 * Normalize a hex string sequence.
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
  hexString: string,
  prefix = true,
): string =>
  stringPrefixNormalizer(MATCH.HEX_STRING, hexString.toLowerCase(), prefix);

/**
 * Normalize the recovery param of an Ethereum ECDSA signature.
 *
 * @NOTE This will only work for Ethereum based signatures since this is using
 * the values from EIP-155
 *
 * This will basically add 27 to the recovery param value if that is either 0 or 1 (odd or even).
 * If it's any other value, leave it as it is.
 *
 * See EIP-155 for the 27 and 28 magic numbers expected in the recovery parameter:
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
 *
 * @method recoveryParamNormalizer
 *
 * @param {number} recoveryParam The recovery param value to normalize
 * (The one extracted from the signature)
 *
 * @return {number} The normalized recovery param value
 */
export const recoveryParamNormalizer = (recoveryParam: number): number => {
  if (typeof recoveryParam !== 'number') {
    throw new Error('Recovery param value is not valid');
  }
  let normalizedRecoveryParam = recoveryParam;
  if (recoveryParam === 0) {
    normalizedRecoveryParam = SIGNATURE.RECOVERY_ODD;
  }
  if (recoveryParam === 1) {
    normalizedRecoveryParam = SIGNATURE.RECOVERY_EVEN;
  }
  return normalizedRecoveryParam;
};
