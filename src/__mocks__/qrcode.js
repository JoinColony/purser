const qrcodeMockedObject = {
  toDataURL: jest.fn(
    value =>
      new Promise((resolve, reject) => {
        if (value) {
          return resolve('base64');
        }
        return reject();
      }),
  ),
};

export default qrcodeMockedObject;
