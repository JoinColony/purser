const mockedSigner = {
  sendTransaction: jest.fn(() => ({ hash: '0xcabcab' })),
  signMessage: jest.fn(() => '0xccccc'),
};

export class Web3Provider {
  sendTransaction = jest.fn(() => ({ hash: '0xcabcab' }));

  getTransaction = jest.fn(() => ({ hash: '0xcabcab' }));

  getSigner = jest.fn(() => mockedSigner);
}
