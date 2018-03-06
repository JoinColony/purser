const blockiesMockedObject = {
  create: jest.fn(() => ({
    toDataURL: jest.fn(() => 'base64'),
  })),
};

export default blockiesMockedObject;
