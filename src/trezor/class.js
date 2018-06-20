/* eslint-disable flowtype/require-valid-file-annotation */

export class TrezorWallet {
  constructor() {
    window.addEventListener('message', event => {
      const { data, isTrusted, origin } = event;
      const sameOrigin =
        this.prompt &&
        this.__sanitizeUrl(this.prompt.origin) === this.__sanitizeUrl(origin);
      if (isTrusted && sameOrigin && data === 'handshake') {
        this.prompt.instance.postMessage(
          this.prompt.payload,
          this.prompt.origin,
        );
      }
      if (isTrusted && sameOrigin && data && data.success) {
        console.log('response', data);
        this.prompt.instance.close();
        window.removeEventListener('message', null);
      }
    });
  }

  getFirstEthereumAddress() {
    delete this.prompt;
    const prompt = this.__promptGenerator();
    const payload = {
      type: 'ethgetaddress',
      address_n: [2147483692, 2147483708, 2147483648, 0, 0],
    };
    const origin = 'https://connect.trezor.io';
    this.prompt = {
      instance: prompt,
      payload,
      origin,
    };
  }

  /* eslint-disable-next-line class-methods-use-this */
  __promptGenerator() {
    const width = 600;
    const height = 500;
    const promptOptions = {
      width,
      height,
      /*
       * We need the actual screen size, not the browser window size, since
       * we want to center the prompt prompt in the middle of the screen.
       */
      left: (window.screen.width - width) / 2,
      top: (window.screen.height - height) / 2,
      menubar: false,
      toolbar: false,
      location: false,
      personalbar: false,
      status: false,
    };
    const promptOptionsString = Object.keys(promptOptions).reduce(
      (optionsString, option) =>
        `${optionsString}${option}=${
          promptOptions[option] === false ? 'no' : promptOptions[option]
        },`,
      '',
    );
    return window.open(
      `https://connect.trezor.io/4/popup/popup.html?v=${new Date().getTime()}`,
      'trezor-connect',
      promptOptionsString,
    );
  }

  /* eslint-disable-next-line class-methods-use-this */
  __sanitizeUrl(url) {
    if (typeof url === 'string') {
      return url.match(/^.+:\/\/[^‌​/]+/)[0];
    }
    return '';
  }
}

export const open = () => new TrezorWallet();

export const create = () =>
  console.log(
    "Cannot create a new wallet, it's harware",
    'generated via the derived HD path',
  );
