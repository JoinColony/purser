/*
 * Flow doesn't play well with `trezor.js`'s module export so we need to declare
 * it explicitly. Not that it's naming helps in any way...
 *
 * See: https://github.com/facebook/flow/issues/2092
 */
declare module 'trezor.js' {
  declare module.exports: any;
}
