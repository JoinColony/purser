export const fromMnemonic = jest.fn(mnemonic => ({
  derivePath: jest.fn(() => {
    if (mnemonic === 'mocked-mnemonic') {
      return { privateKey: 'mocked-private-key' };
    }
    return { privateKey: 'another-mocked-private-key' };
  }),
}));

export const isValidMnemonic = jest.fn(mnemonic => {
  if (mnemonic === 'mocked-mnemonic') {
    return true;
  }
  return false;
});
