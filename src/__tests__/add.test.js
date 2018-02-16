import add from '../add';

describe('Add() module test (a test to test the test)', () => {
  test('It runs (also give the correct answer)', () => {
    expect(add(1, 2)).toBe(3);
  });
});
