import { windowFeaturesSerializer } from '../../../trezor/helpers';

jest.dontMock('../../../trezor/helpers');

jest.mock('../../../trezor/validators');

const testFeaturesObject = {
  stringFeature: 'string',
  numberFeature: 13,
};

describe('`Trezor` Hardware Wallet Module Helpers', () => {
  describe('`windowFeaturesSerializer()` helper', () => {
    test('It should serialize window features', () => {
      const { stringFeature, numberFeature } = testFeaturesObject;
      const serializedWindowOptions = windowFeaturesSerializer(
        testFeaturesObject,
      );
      expect(serializedWindowOptions).toEqual(
        `stringFeature=${stringFeature},numberFeature=${numberFeature},`,
      );
    });
    test('It should serialize a window boolean feature as yes/no', () => {
      const serializedWindowOptions = windowFeaturesSerializer({
        booleanFeature: false,
      });
      expect(serializedWindowOptions).toEqual(`booleanFeature=no,`);
    });
  });
});
