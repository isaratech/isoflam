import { getWallEnd } from '../DrawRectangle';

describe('getWallEnd', () => {
  const from = { x: 2, y: 3 };

  it('keeps a wall straight along x when the mouse moved most along x', () => {
    expect(getWallEnd(from, { x: 7, y: 5 })).toEqual({ x: 7, y: 3 });
  });

  it('keeps a wall straight along y when the mouse moved most along y', () => {
    expect(getWallEnd(from, { x: 1, y: -4 })).toEqual({ x: 2, y: -4 });
  });
});
