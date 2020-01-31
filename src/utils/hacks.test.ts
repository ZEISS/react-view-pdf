import { generateUrl } from './hacks';

describe('Hacks', () => {
  describe('Generate URLs', () => {
    it('Generates the correct URLs', () => {
      expect(generateUrl('/path1/:var1', { var1: 'value1' })).toBe('/path1/value1');
    });

    it('Generates the correct URLs with ending slash', () => {
      expect(generateUrl('/path1/:var1/', { var1: 'value1' })).toBe('/path1/value1/');
    });

    it('Generates the correct URLs with null values', () => {
      expect(generateUrl('/path1/:var1/path2/:var2?', { var1: 'value1' })).toBe('/path1/value1/path2/');
    });
  });
});
