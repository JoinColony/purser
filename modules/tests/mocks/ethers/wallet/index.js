export const Wallet = jest.fn().mockImplementation(privateKey => {
  if (privateKey === '0x0' || !privateKey) {
    throw new Error();
  }
  return {
    privateKey,
  };
});

Wallet.createRandom = jest.fn(() => ({ privateKey: 'mocked-private-key' }));

Wallet.isEncryptedWallet = jest.fn(() => true);

Wallet.fromEncryptedWallet = jest.fn(() => ({
  privateKey: 'mocked-private-key',
  address: 'mocked-address',
  mnemonic: 'mocked-mnemonic',
}));

Wallet.verifyMessage = jest.fn((message, signature) => {
  if (!message || !signature) {
    throw new Error();
  }
  return 'mocked-recovered-address';
});

export const HDNode = {
  fromMnemonic: jest.fn(mnemonic => ({
    derivePath: jest.fn(() => {
      if (mnemonic === 'mocked-mnemonic') {
        return { privateKey: 'mocked-private-key' };
      }
      return { privateKey: 'another-mocked-private-key' };
    }),
  })),
  isValidMnemonic: jest.fn(mnemonic => {
    if (mnemonic === 'mocked-mnemonic') {
      return true;
    }
    return false;
  }),
};

const ethersWallet = {
  Wallet,
  HDNode,
};

export default ethersWallet;
