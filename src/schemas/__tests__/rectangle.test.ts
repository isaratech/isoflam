import { rectangleSchema } from '../rectangle';

describe('rectangleSchema', () => {
  const rectangle = { id: 'r1', from: { x: 0, y: 0 }, to: { x: 2, y: 2 } };

  test('accepts a flat rectangle and a volume with or without a roof', () => {
    expect(rectangleSchema.safeParse(rectangle).success).toBe(true);
    expect(
      rectangleSchema.safeParse({ ...rectangle, height: 3, roof: false })
        .success
    ).toBe(true);
  });

  test('rejects a negative, fractional or too large height', () => {
    [-1, 0.5, 21].forEach((height) => {
      expect(rectangleSchema.safeParse({ ...rectangle, height }).success).toBe(
        false
      );
    });
  });
});
