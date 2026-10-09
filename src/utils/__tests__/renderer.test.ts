import { Coords, Size, Scroll } from 'src/types';
import { CoordsUtils, SizeUtils } from 'src/utils';
import { PROJECTED_TILE_SIZE } from 'src/config';
import {
  getElevation,
  getElevationTileOffset,
  getGridSubset,
  getTilePosition,
  getVolumeFaces,
  isWithinVolume,
  isWithinBounds,
  screenToIso
} from '../renderer';

const getRendererSize = (tileSize: Size, zoom: number = 1): Size => {
  const projectedTileSize = SizeUtils.multiply(PROJECTED_TILE_SIZE, zoom);

  return {
    width: projectedTileSize.width * tileSize.width,
    height: projectedTileSize.height * tileSize.height
  };
};

const getScroll = (coords: Coords): Scroll => {
  return {
    position: coords,
    offset: CoordsUtils.zero()
  };
};

describe('Tests renderer utils', () => {
  test('getGridSubset() works correctly', () => {
    const gridSubset = getGridSubset([
      { x: 5, y: 5 },
      { x: 7, y: 7 }
    ]);

    expect(gridSubset).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 6, y: 5 },
      { x: 6, y: 6 },
      { x: 6, y: 7 },
      { x: 7, y: 5 },
      { x: 7, y: 6 },
      { x: 7, y: 7 }
    ]);
  });

  test('isWithinBounds() works correctly', () => {
    const bounds: Coords[] = [
      { x: 4, y: 4 },
      { x: 6, y: 6 }
    ];

    const withinBounds = isWithinBounds({ x: 5, y: 5 }, bounds);
    const onBorder = isWithinBounds({ x: 4, y: 4 }, bounds);
    const outsideBounds = isWithinBounds({ x: 3, y: 3 }, bounds);

    expect(withinBounds).toBe(true);
    expect(onBorder).toBe(true);
    expect(outsideBounds).toBe(false);
  });

  test('screenToIso() works correctly when mouse is at center of project', () => {
    const zoom = 1;
    const rendererSize = getRendererSize({ width: 10, height: 10 }, zoom);
    const scroll = getScroll({ x: 0, y: 0 });
    const tile = screenToIso({
      mouse: {
        x: rendererSize.width / 2,
        y: rendererSize.height / 2
      },
      zoom,
      scroll,
      rendererSize
    });

    expect(tile).toEqual({ x: 0, y: -0 });
  });

  test('screenToIso() works correctly when mouse is at topLeft corner of project', () => {
    const zoom = 1;
    const rendererSize = getRendererSize({ width: 10, height: 10 }, zoom);
    const scroll = getScroll({ x: 0, y: 0 });
    const tile = screenToIso({
      mouse: {
        x: 0,
        y: 0
      },
      zoom,
      scroll,
      rendererSize
    });

    expect(tile).toEqual({ x: 0, y: 10 });
  });

  test('screenToIso() works correctly when mouse is at topLeft corner of project and zoom is 0.5', () => {
    const zoom = 0.5;
    const rendererSize = getRendererSize({ width: 10, height: 10 }, zoom);
    const scroll = getScroll({ x: 0, y: 0 });
    const tile = screenToIso({
      mouse: {
        x: 0,
        y: 0
      },
      zoom,
      scroll,
      rendererSize
    });

    expect(tile).toEqual({ x: 0, y: 10 });
  });

  test('screenToIso() works correctly when mouse is at center of project and zoom is 0.5 and screen is halfway scrolled', () => {
    const zoom = 1;
    const rendererSize = getRendererSize({ width: 10, height: 10 }, zoom);
    const scroll = getScroll({
      x: rendererSize.width / 2,
      y: rendererSize.height / 2
    });
    const tile = screenToIso({
      mouse: {
        x: rendererSize.width / 2,
        y: rendererSize.height / 2
      },
      zoom,
      scroll,
      rendererSize
    });

    expect(tile).toEqual({ x: 0, y: 10 });
  });
});

describe('Connector height', () => {
  test('getElevation() is zero on the ground and one tile per height unit', () => {
    expect(getElevation()).toBe(0);
    expect(getElevation(0)).toBe(0);
    expect(getElevation(2)).toBe(PROJECTED_TILE_SIZE.height * 2);
  });

  test('a raised connector is drawn over the ground tile shifted by its height', () => {
    const groundTile = { x: 3, y: -1 };
    const shifted = CoordsUtils.add(groundTile, getElevationTileOffset(2));

    // Same horizontal screen position, two tile heights higher
    expect(getTilePosition({ tile: shifted }).x).toBeCloseTo(
      getTilePosition({ tile: groundTile }).x
    );
    expect(getTilePosition({ tile: shifted }).y).toBeCloseTo(
      getTilePosition({ tile: groundTile }).y - getElevation(2)
    );
  });
});

describe('Volumes', () => {
  const from = { x: 0, y: 0 };
  const to = { x: 2, y: 1 };

  test('a closed volume has a floor, two front walls and a roof raised by its height', () => {
    const faces = getVolumeFaces({ from, to, height: 3, roof: true });

    expect(
      faces.map((face) => {
        return face.side;
      })
    ).toEqual(['FLOOR', 'LEFT', 'RIGHT', 'ROOF']);

    const [floor, , , roof] = faces;
    roof.points.forEach((point, index) => {
      expect(point.x).toBeCloseTo(floor.points[index].x);
      expect(point.y).toBeCloseTo(floor.points[index].y - getElevation(3));
    });
  });

  test('an open volume only has the floor and the two back walls', () => {
    const faces = getVolumeFaces({ from, to, height: 1, roof: false });
    const floorTop = faces[0].points[2];

    expect(faces).toHaveLength(3);
    // Both walls rise from the back (top) corner of the floor
    expect(faces[1].points).toContainEqual(floorTop);
    expect(faces[2].points).toContainEqual(floorTop);
  });

  test('isWithinVolume() covers the footprint and the raised walls', () => {
    const volume = { from, to, height: 2 };

    expect(isWithinVolume({ x: 1, y: 1 }, volume)).toBe(true);
    expect(isWithinVolume({ x: 4, y: 3 }, volume)).toBe(true);
    expect(isWithinVolume({ x: 5, y: 4 }, volume)).toBe(false);
    expect(isWithinVolume({ x: 4, y: 3 }, { from, to })).toBe(false);
  });
});
