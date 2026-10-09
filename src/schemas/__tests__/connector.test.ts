import { connectorSchema } from '../connector';

describe('connectorSchema', () => {
  const connector = { id: 'c1', anchors: [] };

  test('accepts a connector without a height', () => {
    expect(connectorSchema.safeParse(connector).success).toBe(true);
  });

  test('accepts a whole number of tiles between 0 and 10', () => {
    expect(connectorSchema.safeParse({ ...connector, height: 0 }).success).toBe(
      true
    );
    expect(
      connectorSchema.safeParse({ ...connector, height: 10 }).success
    ).toBe(true);
  });

  test('rejects a negative, fractional or too large height', () => {
    [-1, 1.5, 11].forEach((height) => {
      expect(connectorSchema.safeParse({ ...connector, height }).success).toBe(
        false
      );
    });
  });
});
