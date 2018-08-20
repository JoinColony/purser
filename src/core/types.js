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
export const SUBTYPE_METAMASK: string = 'metamask';

const walletTypes: Object = {
  TYPE_GENERIC,
  TYPE_SOFTWARE,
  TYPE_HARDWARE,
  SUBTYPE_GENERIC,
  SUBTYPE_ETHERS,
  SUBTYPE_TREZOR,
  SUBTYPE_LEDGER,
  SUBTYPE_METAMASK,
};

export default walletTypes;
