export class BaseProvider {
  sendTransaction = jest.fn(() => ({ hash: '0xcabcab' }));

  getTransaction = jest.fn(() => ({ hash: '0xcabcab' }));
}
