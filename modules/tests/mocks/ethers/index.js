export const Signer = jest.fn().mockImplementation(() => ({
  provider: {},
  getAddress: jest.fn(),
  signMessage: jest.fn(),
  sendTransaction: jest.fn(),
}));

const EthersMockedExport = {
  Signer,
};

export default EthersMockedExport;
