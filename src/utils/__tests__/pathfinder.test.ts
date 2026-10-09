import { findPath } from '../pathfinder';

describe('findPath', () => {
  const gridSize = { width: 10, height: 10 };

  it('makes a single right-angle turn when diagonals are not allowed', () => {
    expect(
      findPath({
        gridSize,
        from: { x: 1, y: 1 },
        to: { x: 3, y: 4 },
        allowDiagonal: false
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
        allowDiagonal: false
      })
    ).toEqual([
      { x: 4, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 2 }
    ]);
  });
});
