/* @flow */

/*
 * Default options used to pass down to the QR code generator.
 * Note: They are specific to the `qrcode` library.
 */
export const QR_CODE_OPTS: Object = {
  margin: 0,
  errorCorrectionLevel: 'H',
  width: 200,
};

/*
 * Default options used to pass down to the blockie generator.
 * Note: They are specific to the `ethereum-blockie` library/
 * Warning: They git version and the npm package differ (even if they
 * both claim the same version).
 * Be extra careful.
 */
export const BLOCKIE_OPTS: Object = {
  size: 8,
  scale: 25,
};
