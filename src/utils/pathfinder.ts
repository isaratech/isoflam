import PF from 'pathfinding';
import { Size, Coords } from 'src/types';

interface Args {
  gridSize: Size;
  from: Coords;
  to: Coords;
  allowDiagonal?: boolean;
}

// Straight along x, then straight along y: a single turn. The grid has no obstacles, and a
// shortest orthogonal path from A* would zigzag like a staircase.
const findRightAnglePath = (from: Coords, to: Coords): Coords[] => {
  const stepX = Math.sign(to.x - from.x);
  const stepY = Math.sign(to.y - from.y);
  const tiles: Coords[] = [{ ...from }];

  for (let { x } = from; x !== to.x; ) {
    x += stepX;
    tiles.push({ x, y: from.y });
  }
  for (let { y } = from; y !== to.y; ) {
    y += stepY;
    tiles.push({ x: to.x, y });
  }

  return tiles;
};

export const findPath = ({
  gridSize,
  from,
  to,
  allowDiagonal = true
}: Args): Coords[] => {
  if (!allowDiagonal) return findRightAnglePath(from, to);

  const grid = new PF.Grid(gridSize.width, gridSize.height);
  const finder = new PF.AStarFinder({
    heuristic: PF.Heuristic.manhattan,
    diagonalMovement: PF.DiagonalMovement.Always
  });
  const path = finder.findPath(from.x, from.y, to.x, to.y, grid);

  const pathTiles = path.map((tile) => {
    return {
      x: tile[0],
      y: tile[1]
    };
  });

  return pathTiles;
};
