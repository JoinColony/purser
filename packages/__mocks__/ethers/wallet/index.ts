export const Wallet: jest.Mock<any, any> & {
  createRandom?: jest.Mock<any, any>;
  fromEncryptedJson?: jest.Mock<any, any>;
} = jest.fn().mockImplementation(privateKey => {
  if (privateKey === '0x0' || !privateKey) {
    throw new Error();
  }
  return {
    privateKey,
  };
});

Wallet.createRandom = jest.fn(() => ({ privateKey: 'mocked-private-key' }));

Wallet.fromEncryptedJson = jest.fn(() => ({
  privateKey: 'mocked-private-key',
  address: 'mocked-address',
  mnemonic: 'mocked-mnemonic',
}));

export default Wallet;
