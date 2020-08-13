export const fromMnemonic = jest.fn(mnemonic => ({
  derivePath: jest.fn(() => {
    if (mnemonic === 'all cows are beautiful') {
      return { privateKey: 'mocked-private-key' };
    }
    return { privateKey: 'another-mocked-private-key' };
  }),
}));

export const isValidMnemonic = jest.fn(mnemonic => {
  if (mnemonic === 'all cows are beautiful') {
    return true;
  }
  return false;
});
