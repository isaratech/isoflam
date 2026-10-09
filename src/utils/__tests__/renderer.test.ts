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

  test('getWallFaces() draws the visible sides raised by the height, then the tops', () => {
    const faces = getWallFaces(getPathCorners(tiles), 3, 0.2);
    const sides = faces.filter(({ kind }) => {
      return kind === 'SIDE';
    });
    const tops = faces.filter(({ kind }) => {
      return kind === 'TOP';
    });

    // One top per section, drawn after the sides
    expect(tops).toHaveLength(2);
    expect(faces.slice(-2)).toEqual(tops);
    sides.forEach(({ points: [start, end, topEnd, topStart] }) => {
      expect(topStart.y).toBeCloseTo(start.y - getElevation(3));
      expect(topEnd.y).toBeCloseTo(end.y - getElevation(3));
    });
    // Only the sides facing the viewer: the outer side of each section and the start cap,
    // shaded by the way they face
    expect(
      sides
        .map(({ shade }) => {
          return shade;
        })
        .sort()
    ).toEqual([0.4, 0.4, 0.8]);
  });

  test('getWallFaces() keeps a wall along the screen-vertical diagonal visible', () => {
    // Seen edge on: without a thickness, this wall would be a line
    const faces = getWallFaces(
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 3, y: 3 }
      ],
      1,
      0.2
    );
    const top = faces.find(({ kind }) => {
      return kind === 'TOP';
    });
    const xs =
      top?.points.map(({ x }) => {
        return x;
      }) ?? [];

    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(10);
    expect(
      faces.some(({ kind }) => {
        return kind === 'SIDE';
      })
    ).toBe(true);
  });

  test('getWallFaces() joins sections at any angle with mitred corners', () => {
    const faces = getWallFaces(
      [
        { x: 0, y: 0 },
        { x: 4, y: 1 },
        { x: 5, y: 5 }
      ],
      1,
      0.2
    );
    const [firstTop, secondTop] = faces.filter(({ kind }) => {
      return kind === 'TOP';
    });

    // The end of the first top is the start of the second one
    expect(firstTop.points[1]).toEqual(secondTop.points[0]);
    expect(firstTop.points[2]).toEqual(secondTop.points[3]);
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
    // The junction spans each crossing road's width: 3 across x (the road along y), 1 across y
    expect(network.junctions).toEqual([
      { position: { x: 2, y: 0 }, size: { x: 3, y: 1 } }
    ]);
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

  test('getRoadNetwork() rounds the turns of a road with sidewalks wider', () => {
    const road = {
      tiles: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 5 }
      ].flatMap((corner, i, corners) => {
        if (i === 0) return [corner];
        const prev = corners[i - 1];
        const steps = Math.max(
          Math.abs(corner.x - prev.x),
          Math.abs(corner.y - prev.y)
        );
        return Array.from({ length: steps }, (_, k) => {
          return {
            x: prev.x + Math.sign(corner.x - prev.x) * (k + 1),
            y: prev.y + Math.sign(corner.y - prev.y) * (k + 1)
          };
        });
      }),
      rectangle: { from: { x: 0, y: 0 } }
    };
    const radius = (sidewalks: boolean) => {
      const { d } = getRoadNetwork(
        [
          {
            path: { ...road, rectangle: { from: { x: 0, y: 0 } } },
            width: 1,
            sidewalks
          }
        ],
        identity,
        1
      ).roads[0];
      // "L x,y Q": distance from the start of the curve to the corner
      const [, curveStart] = d.match(/L ([^ ]+) Q/) ?? [];
      return Math.abs(Number(curveStart.split(',')[0]) - -5);
    };

    expect(radius(true)).toBeGreaterThan(radius(false));
  });

  test('getRoadSpan() covers whole tiles on both sides of the centre line', () => {
    expect(getRoadSpan(1)).toEqual({ from: 0, to: 0 });
    expect(getRoadSpan(3)).toEqual({ from: -1, to: 1 });
    expect(getRoadSpan(4)).toEqual({ from: -1, to: 2 });
  });
});
