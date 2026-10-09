import { Coords, Size, Scroll } from 'src/types';
import { CoordsUtils, SizeUtils } from 'src/utils';
import { PROJECTED_TILE_SIZE } from 'src/config';
import {
  getElevation,
  getConnectorGroundTile,
  getElevationTileOffset,
  getPathCorners,
  getRoadNetwork,
  getRoadSpan,
  getRoundedPathD,
  getWallFaces,
  getGridSubset,
  getTilePosition,
  getVolumeFaces,
  isVolume,
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

  test('isVolume() is only true for plain rectangles with a height', () => {
    expect(isVolume({ height: 2 })).toBe(true);
    expect(isVolume({ height: 0 })).toBe(false);
    expect(isVolume({ height: 2, imageData: 'data:image/png;base64,' })).toBe(
      false
    );
    expect(isVolume({ height: 2, texture: 'ROAD' })).toBe(false);
  });
});

describe('Walls', () => {
  // An L-shaped wall: (0,0) -> (2,0) -> (2,2)
  const tiles = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 }
  ];

  test('getPathCorners() keeps the ends and the turns only', () => {
    expect(getPathCorners(tiles)).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 }
    ]);
  });

  test('getWallFaces() raises one face per section between corners by the wall height', () => {
    const faces = getWallFaces(getPathCorners(tiles), 3);

    expect(faces).toHaveLength(2);
    faces.forEach(({ points: [start, end, topEnd, topStart] }) => {
      expect(topStart.y).toBeCloseTo(start.y - getElevation(3));
      expect(topEnd.y).toBeCloseTo(end.y - getElevation(3));
    });
    // The two sections face different sides, so they are shaded differently
    expect(
      new Set(
        faces.map(({ side }) => {
          return side;
        })
      ).size
    ).toBe(2);
  });

  test('getWallFaces() draws a section at any angle in one face', () => {
    const faces = getWallFaces(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 5, y: 2 }
      ],
      1
    );

    expect(faces).toHaveLength(1);
    expect(faces[0].points[1]).toEqual(
      getTilePosition({ tile: { x: 5, y: 2 } })
    );
  });

  test('getConnectorGroundTile() finds the foot of the wall under a raised tile', () => {
    const wall = {
      height: 2,
      path: {
        tiles: [
          { x: 0, y: 0 },
          { x: 1, y: 0 }
        ],
        rectangle: { from: { x: 1, y: 0 } }
      }
    };

    expect(getConnectorGroundTile(wall, { x: 2, y: 1 })).toEqual({
      x: 1,
      y: 0
    });
    expect(getConnectorGroundTile(wall, { x: 5, y: 5 })).toBeNull();
  });
});

describe('Roads', () => {
  const identity = (tile: { x: number; y: number }) => {
    return tile;
  };

  test('getRoundedPathD() rounds the corners with a quadratic curve', () => {
    expect(
      getRoundedPathD(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 }
        ],
        2
      )
    ).toBe('M 0,0 L 8,0 Q 10,0 10,2 L 10,10');
  });

  test('getRoadNetwork() marks the tiles shared by roads as junctions', () => {
    // Two crossing roads: along x through (2,0) and along y through (2,0)
    const alongX = {
      tiles: [0, 1, 2, 3, 4].map((x) => {
        return { x, y: 0 };
      }),
      rectangle: { from: { x: 4, y: 0 } }
    };
    const alongY = {
      tiles: [0, 1, 2, 3, 4].map((y) => {
        return { x: 0, y };
      }),
      rectangle: { from: { x: 2, y: 2 } }
    };

    const network = getRoadNetwork(
      [
        { path: alongX, width: 1 },
        { path: alongY, width: 3 }
      ],
      identity,
      1
    );

    expect(network.roads).toHaveLength(2);
    // The junction is as wide as the widest road
    expect(network.junctions).toEqual([{ position: { x: 2, y: 0 }, width: 3 }]);
  });

  test('getRoadNetwork() extends free road ends to the edge of their tile', () => {
    const road = {
      tiles: [0, 1, 2].map((x) => {
        return { x, y: 0 };
      }),
      rectangle: { from: { x: 2, y: 0 } }
    };

    expect(
      getRoadNetwork([{ path: road, width: 1 }], identity, 1).roads[0].d
    ).toBe('M 2.5,0 L -0.5,0');
  });

  test('getRoadNetwork() puts an even-width road on the tile borders', () => {
    const road = {
      tiles: [0, 1, 2].map((x) => {
        return { x, y: 0 };
      }),
      rectangle: { from: { x: 2, y: 0 } }
    };

    // Shifted half a tile across, not along, so it still ends on the tile edges
    expect(
      getRoadNetwork([{ path: road, width: 4 }], identity, 1).roads[0].d
    ).toBe('M 2.5,0.5 L -0.5,0.5');
  });

  test('getRoadSpan() covers whole tiles on both sides of the centre line', () => {
    expect(getRoadSpan(1)).toEqual({ from: 0, to: 0 });
    expect(getRoadSpan(3)).toEqual({ from: -1, to: 1 });
    expect(getRoadSpan(4)).toEqual({ from: -1, to: 2 });
  });
});
