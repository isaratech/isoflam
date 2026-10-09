import { findPath } from '../pathfinder';

describe('findPath', () => {
  const gridSize = { width: 10, height: 10 };

  it('makes a single right-angle turn with the RIGHT_ANGLE routing', () => {
    expect(
      findPath({
        gridSize,
        from: { x: 1, y: 1 },
        to: { x: 3, y: 4 },
        routing: 'RIGHT_ANGLE'
      })
    ).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 }
    ]);
  });

  it('goes straight when the ends are aligned', () => {
    expect(
      findPath({
        gridSize,
        from: { x: 4, y: 2 },
        to: { x: 2, y: 2 },
        routing: 'RIGHT_ANGLE'
      })
    ).toEqual([
      { x: 4, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 2 }
    ]);
  });

  it('follows the straight line at any angle with the STRAIGHT routing', () => {
    expect(
      findPath({
        gridSize,
        from: { x: 0, y: 0 },
        to: { x: 4, y: 2 },
        routing: 'STRAIGHT'
      })
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 2 }
    ]);
  });
});
