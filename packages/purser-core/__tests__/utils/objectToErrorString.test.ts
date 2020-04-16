import { objectToErrorString } from '../../src/utils';

describe('`Core` Module', () => {
  describe('`objectToErrorString()` util', () => {
    test("Returns 'key (value)' string pairs from a String", () => {
      const objectToSerialize = {
        suit: 'spade',
      };
      expect(objectToErrorString(objectToSerialize)).toEqual('suit (spade),');
    });
    test("Returns 'key (value)' string pairs from a Number", () => {
      const objectToSerialize = {
        cardNumber: 10,
      };
      expect(objectToErrorString(objectToSerialize)).toEqual(
        'cardNumber (10),',
      );
    });
    test("Returns 'key (value)' string pairs from an Array", () => {
      const objectToSerialize = {
        antes: [100, '200'],
      };
      expect(objectToErrorString(objectToSerialize)).toEqual(
        'antes ([100,200]),',
      );
    });
    test("Returns 'key (value)' string pairs from an Object", () => {
      const objectToSerialize = {
        dealer: { name: 'Larry' },
      };
      expect(objectToErrorString(objectToSerialize)).toEqual(
        'dealer ({name:Larry}),',
      );
    });
  });
});
