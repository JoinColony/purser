export const encrypt = jest.fn(() => 'mocked-keystore');

const secretStorage = {
  encrypt,
};

export default secretStorage;
