import PF from 'pathfinding';
import { Size, Coords } from 'src/types';

// SHORTEST: A* with diagonal moves (links between icons); RIGHT_ANGLE: one turn (roads);
// STRAIGHT: the tiles along the straight line, whatever its angle (walls)
export type PathRouting = 'SHORTEST' | 'RIGHT_ANGLE' | 'STRAIGHT';

interface Args {
  gridSize: Size;
  from: Coords;
  to: Coords;
  routing?: PathRouting;
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

// The tiles crossed by the straight line between the two tile centres
const findStraightPath = (from: Coords, to: Coords): Coords[] => {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
  const tiles: Coords[] = [{ ...from }];

  for (let i = 1; i <= steps; i += 1) {
    tiles.push({
      x: Math.round(from.x + ((to.x - from.x) * i) / steps),
      y: Math.round(from.y + ((to.y - from.y) * i) / steps)
    });
  }

  return tiles;
};

export const findPath = ({
  gridSize,
  from,
  to,
  routing = 'SHORTEST'
}: Args): Coords[] => {
  if (routing === 'RIGHT_ANGLE') return findRightAnglePath(from, to);
  if (routing === 'STRAIGHT') return findStraightPath(from, to);

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
