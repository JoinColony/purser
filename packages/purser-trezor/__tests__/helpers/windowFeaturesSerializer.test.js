import { windowFeaturesSerializer } from '@colony/purser-trezor/helpers';

jest.dontMock('@colony/purser-trezor/helpers');

const testFeaturesObject = {
  stringFeature: 'string',
  numberFeature: 13,
};

describe('`Trezor` Hardware Wallet Module Helpers', () => {
  describe('`windowFeaturesSerializer()` helper', () => {
    test('Should serialize window features', () => {
      const { stringFeature, numberFeature } = testFeaturesObject;
      const serializedWindowOptions = windowFeaturesSerializer(
        testFeaturesObject,
      );
      expect(serializedWindowOptions).toEqual(
        `stringFeature=${stringFeature},numberFeature=${numberFeature},`,
      );
    });
    test('Should serialize a window boolean feature as yes/no', () => {
      const serializedWindowOptions = windowFeaturesSerializer({
        booleanFeature: false,
      });
      expect(serializedWindowOptions).toEqual(`booleanFeature=no,`);
    });
  });
});
