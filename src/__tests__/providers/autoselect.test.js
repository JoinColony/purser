import { autoselect } from '../../providers';
import { PROVIDER_PROTO } from '../../defaults';
import * as utils from '../../utils';

jest.mock('../../utils');

describe('`providers` module', () => {
  describe('autoselect providers from a list', () => {
    test('Try to connect to function providers', () => {
      const mockedProvider1 = jest.fn();
      const mockedProvider2 = jest.fn();
      autoselect([mockedProvider1, mockedProvider2]);
      expect(mockedProvider1).toHaveBeenCalled();
      expect(mockedProvider2).toHaveBeenCalled();
    });
    test('Try to connect to object providers', () => {
      const mockedProvider1 = { chainId: 1 };
      const mockedProvider2 = jest.fn();
      const mockedProvider3 = { chainId: 3 };
      const provider = autoselect([
        mockedProvider1,
        mockedProvider2,
        mockedProvider3,
      ]);
      expect(provider).toEqual(mockedProvider1);
    });
    test('Show an error if the providers array is empty', () => {
      const provider = autoselect([]);
      expect(utils.warning).toHaveBeenCalled();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
    test('Show an error if it could not connect to any providers', () => {
      const provider = autoselect([{ chainId: false }, {}, () => {}]);
      expect(utils.warning).toHaveBeenCalled();
      expect(provider).toEqual(PROVIDER_PROTO);
    });
  });
});
