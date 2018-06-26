/*
 * Flow doesn't play well with `hdkey's` module export so we need to declare
 * it explicitly.
 *
 * See: https://github.com/facebook/flow/issues/2092
 */
declare module 'hdkey' {
  declare module.exports: any;
}
