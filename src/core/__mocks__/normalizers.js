/*
 * The mocks folder had to be renamed in order for `jest` to not pick it up as duplicate haste mock file.
 * See:
 * https://github.com/facebook/jest/issues/2070
 */

export const derivationPathNormalizer = jest.fn(value => value);

export const multipleOfTwoHexValueNormalizer = jest.fn(value => value);

export const addressNormalizer = jest.fn(value => value);

export const hexSequenceNormalizer = jest.fn(value => value);
