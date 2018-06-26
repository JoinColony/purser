/* @flow */

/*
 * Main wallet types
 */
export const TYPE_SOFTWARE: string = 'software';
export const TYPE_HARDWARE: string = 'hardware';

/*
 * Wallet subtypes
 */
export const SUBTYPE_ETHERS: string = 'ethers';
export const SUBTYPE_TREZOR: string = 'trezor';

const walletTypes: Object = {
  TYPE_SOFTWARE,
  TYPE_HARDWARE,
  SUBTYPE_ETHERS,
  SUBTYPE_TREZOR,
};

export default walletTypes;
