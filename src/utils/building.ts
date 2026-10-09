import { Coords } from 'src/types';
import { getBoundingBox, getElevation, getTilePosition } from './renderer';

export const buildingRoofOptions = ['FLAT', 'GABLE', 'HIP'] as const;
export type BuildingRoof = (typeof buildingRoofOptions)[number];
export type BuildingFacade = 'LEFT' | 'RIGHT';

export interface BuildingFace {
  kind: 'WALL' | 'ROOF';
  // Screen points
  points: Coords[];
  // How much the face is darkened
  shade: number;
}

export interface BuildingOpening {
  kind: 'WINDOW' | 'DOOR';
  points: Coords[];
}

interface Point3 {
  x: number;
  y: number;
  z: number;
}

interface GetBuilding {
  from: Coords;
  to: Coords;
  // Wall height in tiles, one floor per tile
  height: number;
  roof: BuildingRoof;
  // Height of the top of the roof above the walls, in tiles
  roofHeight: number;
  windows: boolean;
  door: boolean;
  // Facade with the door: LEFT faces the bottom left of the screen, RIGHT the bottom right
  doorFacade: BuildingFacade;
}

const sub = (a: Point3, b: Point3): Point3 => {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
};
const cross = (a: Point3, b: Point3): Point3 => {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
};
const dot = (a: Point3, b: Point3) => {
  return a.x * b.x + a.y * b.y + a.z * b.z;
};
const normalise = (v: Point3): Point3 => {
  const length = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / length, y: v.y / length, z: v.z / length };
};

// Direction from the scene towards the viewer of the isometric projection: moving along it
// doesn't move a point on screen
const TOWARDS_VIEWER: Point3 = { x: -1, y: -1, z: 1 };

const project = ({ x, y, z }: Point3): Coords => {
  const position = getTilePosition({ tile: { x, y } });
  return { x: position.x, y: position.y - getElevation(z) };
};

// Faces facing the bottom left are lighter than those facing the bottom right, and the
// steeper a roof face, the darker
const getShade = (normal: Point3) => {
  const facingLeft = Math.max(0, -normal.x);
  const facingRight = Math.max(0, -normal.y);
  const sideways =
    facingLeft + facingRight > 0
      ? 0.4 + (0.4 * facingRight) / (facingLeft + facingRight)
      : 0.4;

  return sideways * (1 - Math.max(0, normal.z));
};

// A building on a rectangle footprint: its walls and roof form a convex solid, so the faces
// facing the viewer never overlap and need no sorting. Windows (one per tile and floor) and
// the door are drawn on the two facades facing the viewer.
export const getBuilding = ({
  from,
  to,
  height,
  roof,
  roofHeight,
  windows,
  door,
  doorFacade
}: GetBuilding) => {
  const [low, , high] = getBoundingBox([from, to]);
  const x0 = low.x - 0.5;
  const x1 = high.x + 0.5;
  const y0 = low.y - 0.5;
  const y1 = high.y + 0.5;
  const top = height;
  const apex = roof === 'FLAT' ? top : top + roofHeight;
  const centre: Point3 = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: apex / 2 };

  const walls: Point3[][] = [
    // Left facade (x = x0), from the left corner to the bottom corner
    [
      { x: x0, y: y1, z: 0 },
      { x: x0, y: y0, z: 0 },
      { x: x0, y: y0, z: top },
      { x: x0, y: y1, z: top }
    ],
    // Right facade (y = y0), from the bottom corner to the right corner
    [
      { x: x0, y: y0, z: 0 },
      { x: x1, y: y0, z: 0 },
      { x: x1, y: y0, z: top },
      { x: x0, y: y0, z: top }
    ],
    [
      { x: x1, y: y0, z: 0 },
      { x: x1, y: y1, z: 0 },
      { x: x1, y: y1, z: top },
      { x: x1, y: y0, z: top }
    ],
    [
      { x: x1, y: y1, z: 0 },
      { x: x0, y: y1, z: 0 },
      { x: x0, y: y1, z: top },
      { x: x1, y: y1, z: top }
    ]
  ];

  const eaves = [
    { x: x0, y: y0, z: top },
    { x: x1, y: y0, z: top },
    { x: x1, y: y1, z: top },
    { x: x0, y: y1, z: top }
  ];
  const [sw, se, ne, nw] = eaves;
  const roofs: Point3[][] = [];

  if (roof === 'FLAT' || roofHeight <= 0) {
    roofs.push(eaves);
  } else {
    // The ridge runs along the longest side; a hip roof slopes at both ends too
    const alongX = x1 - x0 >= y1 - y0;
    const halfSpan = (alongX ? y1 - y0 : x1 - x0) / 2;
    const inset =
      roof === 'HIP' ? Math.min(halfSpan, (alongX ? x1 - x0 : y1 - y0) / 2) : 0;

    if (alongX) {
      const ym = (y0 + y1) / 2;
      const r0 = { x: x0 + inset, y: ym, z: apex };
      const r1 = { x: x1 - inset, y: ym, z: apex };
      roofs.push(
        [sw, se, r1, r0],
        [ne, nw, r0, r1],
        [nw, sw, r0],
        [se, ne, r1]
      );
    } else {
      const xm = (x0 + x1) / 2;
      const r0 = { x: xm, y: y0 + inset, z: apex };
      const r1 = { x: xm, y: y1 - inset, z: apex };
      roofs.push(
        [nw, sw, r0, r1],
        [se, ne, r1, r0],
        [sw, se, r0],
        [ne, nw, r1]
      );
    }
  }

  // Outward normal of a flat polygon of the solid
  const getNormal = (polygon: Point3[]) => {
    const normal = normalise(
      cross(sub(polygon[1], polygon[0]), sub(polygon[2], polygon[0]))
    );
    const middle = polygon.reduce(
      (sum, p) => {
        return {
          x: sum.x + p.x / polygon.length,
          y: sum.y + p.y / polygon.length,
          z: sum.z + p.z / polygon.length
        };
      },
      { x: 0, y: 0, z: 0 }
    );

    return dot(normal, sub(middle, centre)) < 0
      ? { x: -normal.x, y: -normal.y, z: -normal.z }
      : normal;
  };

  const toFaces = (polygons: Point3[][], kind: BuildingFace['kind']) => {
    return polygons
      .filter((polygon) => {
        // Degenerate faces (a hip roof on a square has a single-point ridge) are skipped
        const area = cross(
          sub(polygon[1], polygon[0]),
          sub(polygon[2], polygon[0])
        );
        return Math.hypot(area.x, area.y, area.z) > 1e-9;
      })
      .map((polygon) => {
        return { polygon, normal: getNormal(polygon) };
      })
      .filter(({ normal }) => {
        return dot(normal, TOWARDS_VIEWER) > 1e-9;
      })
      .map(({ polygon, normal }): BuildingFace => {
        return {
          // The vertical ends of a gable roof are part of the walls
          kind: Math.abs(normal.z) < 1e-9 ? 'WALL' : kind,
          points: polygon.map(project),
          shade: getShade(normal)
        };
      });
  };

  // Openings on the two facades facing the viewer
  const openings: BuildingOpening[] = [];
  const facades: { facade: BuildingFacade; length: number }[] = [
    { facade: 'LEFT', length: y1 - y0 },
    { facade: 'RIGHT', length: x1 - x0 }
  ];
  // A point on a facade, `along` tiles from its left end and `up` tiles above the ground
  const onFacade = (facade: BuildingFacade, along: number, up: number) => {
    return facade === 'LEFT'
      ? project({ x: x0, y: y1 - along, z: up })
      : project({ x: x0 + along, y: y0, z: up });
  };
  const opening = (
    kind: BuildingOpening['kind'],
    facade: BuildingFacade,
    centreAlong: number,
    width: number,
    bottom: number,
    upper: number
  ): BuildingOpening => {
    return {
      kind,
      points: [
        onFacade(facade, centreAlong - width / 2, bottom),
        onFacade(facade, centreAlong + width / 2, bottom),
        onFacade(facade, centreAlong + width / 2, upper),
        onFacade(facade, centreAlong - width / 2, upper)
      ]
    };
  };

  facades.forEach(({ facade, length }) => {
    const doorColumn =
      door && facade === doorFacade ? Math.floor(length / 2) : -1;

    for (let column = 0; column < length; column += 1) {
      for (let floor = 0; floor < Math.floor(height); floor += 1) {
        if (floor === 0 && column === doorColumn) {
          openings.push(opening('DOOR', facade, column + 0.5, 0.5, 0, 0.75));
        } else if (windows) {
          openings.push(
            opening(
              'WINDOW',
              facade,
              column + 0.5,
              0.4,
              floor + 0.35,
              floor + 0.8
            )
          );
        }
      }
    }
  });

  return {
    faces: [...toFaces(walls, 'WALL'), ...toFaces(roofs, 'ROOF')],
    openings
  };
};
