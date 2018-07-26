/* @flow */

/*
 * Main wallet types
 */
export const TYPE_SOFTWARE: string = 'software';
export const TYPE_HARDWARE: string = 'hardware';
export const TYPE_GENERIC: string = 'generic';

/*
 * Wallet subtypes
 */
export const SUBTYPE_GENERIC: string = 'generic';
export const SUBTYPE_ETHERS: string = 'ethers';
export const SUBTYPE_TREZOR: string = 'trezor';
export const SUBTYPE_LEDGER: string = 'ledger';

const walletTypes: Object = {
  TYPE_SOFTWARE,
  TYPE_HARDWARE,
  SUBTYPE_ETHERS,
  SUBTYPE_TREZOR,
  SUBTYPE_LEDGER,
};

export default walletTypes;
