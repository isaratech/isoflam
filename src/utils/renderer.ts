import { produce } from 'immer';
import {
  CONNECTOR_SEARCH_OFFSET,
  DEFAULT_FONT_FAMILY,
  MAX_ZOOM,
  MIN_ZOOM,
  PROJECT_BOUNDING_BOX_PADDING,
  PROJECTED_TILE_SIZE,
  TEXTBOX_DEFAULTS,
  TEXTBOX_PADDING,
  UNPROJECTED_TILE_SIZE,
  ZOOM_INCREMENT
} from 'src/config';
import {
  AnchorPosition,
  BoundingBox,
  Connector,
  ConnectorAnchor,
  Coords,
  ItemReference,
  Mouse,
  ProjectionOrientationEnum,
  Rect,
  Scroll,
  Size,
  SlimMouseEvent,
  TextBox,
  TileOrigin,
  View
} from 'src/types';
import {
  clamp,
  CoordsUtils,
  findPath,
  getItemByIdOrThrow,
  roundToOneDecimalPlace,
  SizeUtils,
  toPx
} from 'src/utils';
import type { PathRouting } from 'src/utils/pathfinder';
import { useScene } from 'src/hooks/useScene';

interface ScreenToIso {
  mouse: Coords;
  zoom: number;
  scroll: Scroll;
  rendererSize: Size;
}

// converts a mouse position to a tile position
export const screenToIso = ({
  mouse,
  zoom,
  scroll,
  rendererSize
}: ScreenToIso) => {
  const projectedTileSize = SizeUtils.multiply(PROJECTED_TILE_SIZE, zoom);
  const halfW = projectedTileSize.width / 2;
  const halfH = projectedTileSize.height / 2;

  const projectPosition = {
    x: -rendererSize.width * 0.5 + mouse.x - scroll.position.x,
    y: -rendererSize.height * 0.5 + mouse.y - scroll.position.y
  };

  const tile = {
    x: Math.floor(
      (projectPosition.x + halfW) / projectedTileSize.width -
        projectPosition.y / projectedTileSize.height
    ),
    y: -Math.floor(
      (projectPosition.y + halfH) / projectedTileSize.height +
        projectPosition.x / projectedTileSize.width
    )
  };

  return tile;
};

interface GetTilePosition {
  tile: Coords;
  origin?: TileOrigin;
}

export const getTilePosition = ({
  tile,
  origin = 'CENTER'
}: GetTilePosition) => {
  const halfW = PROJECTED_TILE_SIZE.width / 2;
  const halfH = PROJECTED_TILE_SIZE.height / 2;

  const position: Coords = {
    x: halfW * tile.x - halfW * tile.y,
    y: -(halfH * tile.x + halfH * tile.y)
  };

  switch (origin) {
    case 'TOP':
      return CoordsUtils.add(position, { x: 0, y: -halfH });
    case 'BOTTOM':
      return CoordsUtils.add(position, { x: 0, y: halfH });
    case 'LEFT':
      return CoordsUtils.add(position, { x: -halfW, y: 0 });
    case 'RIGHT':
      return CoordsUtils.add(position, { x: halfW, y: 0 });
    case 'CENTER':
    default:
      return position;
  }
};

type IsoToScreen = GetTilePosition & {
  rendererSize: Size;
};

export const isoToScreen = ({ tile, origin, rendererSize }: IsoToScreen) => {
  const position = getTilePosition({ tile, origin });

  return {
    x: position.x + rendererSize.width / 2,
    y: position.y + rendererSize.height / 2
  };
};

export const sortByPosition = (tiles: Coords[]) => {
  const xSorted = [...tiles];
  const ySorted = [...tiles];
  xSorted.sort((a, b) => {
    return a.x - b.x;
  });
  ySorted.sort((a, b) => {
    return a.y - b.y;
  });

  const highest = {
    byX: xSorted[xSorted.length - 1],
    byY: ySorted[ySorted.length - 1]
  };
  const lowest = { byX: xSorted[0], byY: ySorted[0] };

  const lowX = lowest.byX.x;
  const highX = highest.byX.x;
  const lowY = lowest.byY.y;
  const highY = highest.byY.y;

  return {
    byX: xSorted,
    byY: ySorted,
    highest,
    lowest,
    lowX,
    lowY,
    highX,
    highY
  };
};

// Returns a complete set of tiles that form a grid area (takes in any number of tiles to use points to encapsulate)
export const getGridSubset = (tiles: Coords[]) => {
  const { lowX, lowY, highX, highY } = sortByPosition(tiles);

  const subset = [];

  for (let x = lowX; x < highX + 1; x += 1) {
    for (let y = lowY; y < highY + 1; y += 1) {
      subset.push({ x, y });
    }
  }

  return subset;
};

export const isWithinBounds = (tile: Coords, bounds: Coords[]) => {
  const { lowX, lowY, highX, highY } = sortByPosition(bounds);

  return tile.x >= lowX && tile.x <= highX && tile.y >= lowY && tile.y <= highY;
};

// Returns the four corners of a grid that encapsulates all tiles
// passed in (at least 1 tile needed)
export const getBoundingBox = (
  tiles: Coords[],
  offset: Coords = CoordsUtils.zero()
): BoundingBox => {
  const { lowX, lowY, highX, highY } = sortByPosition(tiles);

  return [
    { x: lowX - offset.x, y: lowY - offset.y },
    { x: highX + offset.x, y: lowY - offset.y },
    { x: highX + offset.x, y: highY + offset.y },
    { x: lowX - offset.x, y: highY + offset.y }
  ];
};

export const getBoundingBoxSize = (boundingBox: Coords[]): Size => {
  const { lowX, lowY, highX, highY } = sortByPosition(boundingBox);

  return {
    width: highX - lowX + 1,
    height: highY - lowY + 1
  };
};

const isoProjectionBaseValues = [0.707, -0.409, 0.707, 0.409, 0, -0.816];

export const getIsoMatrix = (
  orientation?: keyof typeof ProjectionOrientationEnum
) => {
  switch (orientation) {
    case ProjectionOrientationEnum.Y:
      return produce(isoProjectionBaseValues, (draft) => {
        draft[1] = -draft[1];
        draft[2] = -draft[2];
      });
    case ProjectionOrientationEnum.X:
    default:
      return isoProjectionBaseValues;
  }
};

export const getIsoProjectionCss = (
  orientation?: keyof typeof ProjectionOrientationEnum
) => {
  const matrixTransformValues = getIsoMatrix(orientation);

  return `matrix(${matrixTransformValues.join(', ')})`;
};

export const getTranslateCSS = (translate: Coords = { x: 0, y: 0 }) => {
  return `translate(${translate.x}px, ${translate.y}px)`;
};

export const incrementZoom = (zoom: number) => {
  const newZoom = clamp(zoom + ZOOM_INCREMENT, MIN_ZOOM, MAX_ZOOM);
  return roundToOneDecimalPlace(newZoom);
};

export const decrementZoom = (zoom: number) => {
  // Fit to view can go below MIN_ZOOM: zooming out must never zoom in
  const newZoom = clamp(
    zoom - ZOOM_INCREMENT,
    Math.min(MIN_ZOOM, zoom),
    MAX_ZOOM
  );
  return roundToOneDecimalPlace(newZoom);
};

interface GetMouse {
  interactiveElement: HTMLElement;
  zoom: number;
  scroll: Scroll;
  lastMouse: Mouse;
  mouseEvent: SlimMouseEvent;
  rendererSize: Size;
}

export const getMouse = ({
  interactiveElement,
  zoom,
  scroll,
  lastMouse,
  mouseEvent,
  rendererSize
}: GetMouse): Mouse => {
  const componentOffset = interactiveElement.getBoundingClientRect();
  const offset: Coords = {
    x: componentOffset?.left ?? 0,
    y: componentOffset?.top ?? 0
  };

  const { clientX, clientY } = mouseEvent;

  const mousePosition = {
    x: clientX - offset.x,
    y: clientY - offset.y
  };

  const newPosition: Mouse['position'] = {
    screen: mousePosition,
    tile: screenToIso({
      mouse: mousePosition,
      zoom,
      scroll,
      rendererSize
    })
  };

  const newDelta: Mouse['delta'] = {
    screen: CoordsUtils.subtract(newPosition.screen, lastMouse.position.screen),
    tile: CoordsUtils.subtract(newPosition.tile, lastMouse.position.tile)
  };

  const getMousedown = (): Mouse['mousedown'] => {
    switch (mouseEvent.type) {
      case 'mousedown':
        return {
          ...newPosition,
          button: mouseEvent.button
        };
      case 'mousemove':
        return lastMouse.mousedown;
      default:
        return null;
    }
  };

  const nextMouse: Mouse = {
    position: newPosition,
    delta: newDelta,
    mousedown: getMousedown()
  };

  return nextMouse;
};

export const getAllAnchors = (connectors: Connector[]) => {
  return connectors.reduce((acc, connector) => {
    return [...acc, ...connector.anchors];
  }, [] as ConnectorAnchor[]);
};

export const getAnchorTile = (anchor: ConnectorAnchor, view: View): Coords => {
  if (anchor.ref.item) {
    const viewItem = getItemByIdOrThrow(view.items, anchor.ref.item).value;
    return viewItem.tile;
  }

  if (anchor.ref.anchor) {
    const allAnchors = getAllAnchors(view.connectors ?? []);
    const nextAnchor = getItemByIdOrThrow(allAnchors, anchor.ref.anchor).value;

    return getAnchorTile(nextAnchor, view);
  }

  if (anchor.ref.tile) {
    return anchor.ref.tile;
  }

  throw new Error('Could not get anchor tile.');
};

interface NormalisePositionFromOrigin {
  position: Coords;
  origin: Coords;
}

export const normalisePositionFromOrigin = ({
  position,
  origin
}: NormalisePositionFromOrigin) => {
  return CoordsUtils.subtract(origin, position);
};

interface GetConnectorPath {
  anchors: ConnectorAnchor[];
  view: View;
  routing?: PathRouting;
}

export const getConnectorPath = ({
  anchors,
  view,
  routing = 'SHORTEST'
}: GetConnectorPath): {
  tiles: Coords[];
  rectangle: Rect;
} => {
  if (anchors.length < 2)
    throw new Error(
      `Connector needs at least two anchors (receieved: ${anchors.length})`
    );

  const anchorPosition = anchors.map((anchor) => {
    return getAnchorTile(anchor, view);
  });

  const searchArea = getBoundingBox(anchorPosition, CONNECTOR_SEARCH_OFFSET);

  const sorted = sortByPosition(searchArea);
  const searchAreaSize = getBoundingBoxSize(searchArea);
  const rectangle = {
    from: { x: sorted.highX, y: sorted.highY },
    to: { x: sorted.lowX, y: sorted.lowY }
  };

  const positionsNormalisedFromSearchArea = anchorPosition.map((position) => {
    return normalisePositionFromOrigin({
      position,
      origin: rectangle.from
    });
  });

  const tiles = positionsNormalisedFromSearchArea.reduce<Coords[]>(
    (acc, position, i) => {
      if (i === 0) return acc;

      const prev = positionsNormalisedFromSearchArea[i - 1];
      const path = findPath({
        from: prev,
        to: position,
        gridSize: searchAreaSize,
        routing
      });

      return [...acc, ...path];
    },
    []
  );

  return { tiles, rectangle };
};

type GetRectangleFromSize = (
  from: Coords,
  size: Size
) => { from: Coords; to: Coords };

export const getRectangleFromSize: GetRectangleFromSize = (from, size) => {
  return {
    from,
    to: { x: from.x + size.width, y: from.y + size.height }
  };
};

export const hasMovedTile = (mouse: Mouse) => {
  if (!mouse.delta) return false;

  return !CoordsUtils.isEqual(mouse.delta.tile, CoordsUtils.zero());
};

export const connectorPathTileToGlobal = (
  tile: Coords,
  origin: Coords
): Coords => {
  return CoordsUtils.subtract(
    CoordsUtils.subtract(origin, CONNECTOR_SEARCH_OFFSET),
    CoordsUtils.subtract(tile, CONNECTOR_SEARCH_OFFSET)
  );
};

// Vertical screen offset (in px) of something raised `height` tiles above the ground.
export const getElevation = (height = 0) => {
  return height * PROJECTED_TILE_SIZE.height;
};

// A point raised `height` tiles is drawn over the ground tile shifted by this offset.
export const getElevationTileOffset = (height = 0): Coords => {
  return { x: height, y: height };
};

// A rectangle with a height is drawn as a volume, unless it shows an image or a texture
export const isVolume = (rectangle: {
  height?: number;
  imageData?: string;
  texture?: string;
}) => {
  return (
    Boolean(rectangle.height) && !rectangle.imageData && !rectangle.texture
  );
};

export interface VolumeFace {
  // LEFT / RIGHT: the wall's visible side faces the bottom-left / bottom-right of the screen
  side: 'FLOOR' | 'LEFT' | 'RIGHT' | 'ROOF';
  points: Coords[];
}

// Screen-space faces of a rectangle extruded `height` tiles. With a roof the box is closed
// (front walls + roof); without one only the two back walls are drawn, so its inside stays visible.
export const getVolumeFaces = ({
  from,
  to,
  height,
  roof
}: {
  from: Coords;
  to: Coords;
  height: number;
  roof: boolean;
}): VolumeFace[] => {
  const [low, , high] = getBoundingBox([from, to]);
  const bottom = getTilePosition({ tile: low, origin: 'BOTTOM' });
  const right = getTilePosition({
    tile: { x: high.x, y: low.y },
    origin: 'RIGHT'
  });
  const top = getTilePosition({ tile: high, origin: 'TOP' });
  const left = getTilePosition({
    tile: { x: low.x, y: high.y },
    origin: 'LEFT'
  });
  const elevation = getElevation(height);
  const raise = (point: Coords) => {
    return { x: point.x, y: point.y - elevation };
  };

  const floor: VolumeFace = {
    side: 'FLOOR',
    points: [bottom, right, top, left]
  };

  if (!roof) {
    return [
      floor,
      { side: 'RIGHT', points: [left, top, raise(top), raise(left)] },
      { side: 'LEFT', points: [top, right, raise(right), raise(top)] }
    ];
  }

  return [
    floor,
    { side: 'LEFT', points: [left, bottom, raise(bottom), raise(left)] },
    { side: 'RIGHT', points: [bottom, right, raise(right), raise(bottom)] },
    {
      side: 'ROOF',
      points: [raise(bottom), raise(right), raise(top), raise(left)]
    }
  ];
};

// Whether a tile is covered by a rectangle, including the walls and roof of a volume
// (the slice raised k tiles is drawn over the footprint shifted by (k, k)).
export const isWithinVolume = (
  tile: Coords,
  rectangle: Parameters<typeof isVolume>[0] & { from: Coords; to: Coords }
) => {
  const { from, to } = rectangle;
  const height = isVolume(rectangle) ? rectangle.height ?? 0 : 0;

  // An open volume covers the same screen area: what the roof and front walls would hide
  // is the floor and the back walls
  for (let k = 0; k <= height; k += 1) {
    const groundTile = CoordsUtils.subtract(tile, getElevationTileOffset(k));
    if (isWithinBounds(groundTile, [from, to])) return true;
  }

  return false;
};

export const isRoad = (connector: { variant?: string }) => {
  return connector.variant === 'ROAD';
};

// A connector with a height is drawn as a wall; roads always lie on the ground
export const getWallHeight = (connector: {
  height?: number;
  variant?: string;
}) => {
  return isRoad(connector) ? 0 : connector.height ?? 0;
};

// Walls and roads are shapes drawn on the ground rather than links between icons
export const isWallOrRoad = (connector: {
  height?: number;
  variant?: string;
}) => {
  return isRoad(connector) || getWallHeight(connector) > 0;
};

// Roads turn at right angles, walls go straight at any angle between their corners, and
// links between icons take the shortest path
export const getConnectorRouting = (connector: {
  height?: number;
  variant?: string;
}): PathRouting => {
  if (isRoad(connector)) return 'RIGHT_ANGLE';
  if (getWallHeight(connector) > 0) return 'STRAIGHT';
  return 'SHORTEST';
};

// Global tiles of a connector path, without the duplicates where two path sections meet
export const getConnectorGlobalTiles = (path: {
  tiles: Coords[];
  rectangle: { from: Coords };
}) => {
  return path.tiles
    .map((tile) => {
      return connectorPathTileToGlobal(tile, path.rectangle.from);
    })
    .filter((tile, index, tiles) => {
      return index === 0 || !CoordsUtils.isEqual(tile, tiles[index - 1]);
    });
};

// Keeps only the tiles where the path changes direction (and both ends)
export const getPathCorners = (tiles: Coords[]) => {
  return tiles.filter((tile, index) => {
    if (index === 0 || index === tiles.length - 1) return true;

    const prev = tiles[index - 1];
    const next = tiles[index + 1];

    return (
      tile.x - prev.x !== next.x - tile.x || tile.y - prev.y !== next.y - tile.y
    );
  });
};

// A road's width in tiles, and the width of each of its sidewalks
export const DEFAULT_ROAD_WIDTH = 4;
export const SIDEWALK_WIDTH = 1;

export const getRoadWidth = (connector: { roadWidth?: number }) => {
  return connector.roadWidth ?? DEFAULT_ROAD_WIDTH;
};

// Total width of a road in tiles, sidewalks included
export const getRoadOuterWidth = (connector: {
  roadWidth?: number;
  sidewalks?: boolean;
}) => {
  return (
    getRoadWidth(connector) + (connector.sidewalks ? SIDEWALK_WIDTH * 2 : 0)
  );
};

// Tile offsets, across a road's centre line, of the tiles a road of this width covers. An
// even width is centred on the tile borders so the road covers whole tiles.
export const getRoadSpan = (width: number) => {
  return { from: 0 - Math.floor((width - 1) / 2), to: Math.floor(width / 2) };
};

// The ground tile of the connector under `tile`, which can point anywhere on a wall
// (the slice raised k tiles is drawn over the path shifted by (k, k)); null if none.
export const getConnectorGroundTile = (
  connector: {
    height?: number;
    variant?: string;
    roadWidth?: number;
    sidewalks?: boolean;
    path: { tiles: Coords[]; rectangle: { from: Coords } };
  },
  tile: Coords
): Coords | null => {
  const pathTiles = getConnectorGlobalTiles(connector.path);

  // A road covers its whole width (sidewalks included): use the nearest path tile
  if (isRoad(connector)) {
    const span = getRoadSpan(getRoadOuterWidth(connector));
    const isInSpan = (offset: number) => {
      return offset >= span.from && offset <= span.to;
    };
    // Each path tile covers a band across the road; corners cover a square
    const covering = pathTiles.filter((pathTile, index) => {
      const dx = tile.x - pathTile.x;
      const dy = tile.y - pathTile.y;
      const neighbours = [pathTiles[index - 1], pathTiles[index + 1]].filter(
        Boolean
      );
      const runsAlongX = neighbours.some((n) => {
        return n.y === pathTile.y;
      });
      const runsAlongY = neighbours.some((n) => {
        return n.x === pathTile.x;
      });

      if (runsAlongX && runsAlongY) return isInSpan(dx) && isInSpan(dy);
      if (runsAlongX) return dx === 0 && isInSpan(dy);
      if (runsAlongY) return dy === 0 && isInSpan(dx);
      return dx === 0 && dy === 0;
    });
    const distance = (pathTile: Coords) => {
      return Math.max(
        Math.abs(tile.x - pathTile.x),
        Math.abs(tile.y - pathTile.y)
      );
    };

    return covering.reduce<Coords | null>((nearest, pathTile) => {
      return nearest && distance(nearest) <= distance(pathTile)
        ? nearest
        : pathTile;
    }, null);
  }

  for (let k = 0; k <= getWallHeight(connector); k += 1) {
    const groundTile = CoordsUtils.subtract(tile, getElevationTileOffset(k));
    const isOnPath = pathTiles.some((pathTile) => {
      return CoordsUtils.isEqual(pathTile, groundTile);
    });

    if (isOnPath) return groundTile;
  }

  return null;
};

const toFixed = (value: number) => {
  return Math.round(value * 100) / 100;
};

// SVG path through the points, with the corners rounded by up to `radius`
export const getRoundedPathD = (points: Coords[], radius: number) => {
  if (points.length < 2) return '';

  const format = ({ x, y }: Coords) => {
    return `${toFixed(x)},${toFixed(y)}`;
  };
  const moveTowards = (from: Coords, to: Coords, distance: number) => {
    const length = Math.hypot(to.x - from.x, to.y - from.y);

    return {
      x: from.x + ((to.x - from.x) / length) * distance,
      y: from.y + ((to.y - from.y) / length) * distance
    };
  };

  const corners = points.slice(1, -1).map((corner, index) => {
    const prev = points[index];
    const next = points[index + 2];
    const r = Math.min(
      radius,
      Math.hypot(corner.x - prev.x, corner.y - prev.y) / 2,
      Math.hypot(corner.x - next.x, corner.y - next.y) / 2
    );

    return `L ${format(moveTowards(corner, prev, r))} Q ${format(
      corner
    )} ${format(moveTowards(corner, next, r))}`;
  });

  return [
    `M ${format(points[0])}`,
    ...corners,
    `L ${format(points[points.length - 1])}`
  ].join(' ');
};

interface RoadInput {
  path: { tiles: Coords[]; rectangle: { from: Coords } };
  // In tiles
  width: number;
  sidewalks?: boolean;
}

// Drawing data for a set of roads: one rounded path per road, in local coordinates given
// by `toLocal` (from tile coordinates, possibly fractional), and the junctions (tiles shared
// by several roads) where markings stop. A road end that isn't on a junction is extended to
// the edge of its tile. Widths are in tiles.
export const getRoadNetwork = (
  roads: RoadInput[],
  toLocal: (tile: Coords) => Coords,
  tileSize: number
) => {
  const tileKey = ({ x, y }: Coords) => {
    return `${x},${y}`;
  };
  const roadTiles = roads.map(({ path }) => {
    return getConnectorGlobalTiles(path);
  });

  // For each tile: how many roads pass, and the width of the roads crossing it along each
  // axis (a road running along x spreads across y, and the other way round)
  const roadsPerTile = new Map<
    string,
    { tile: Coords; count: number; acrossX: number; acrossY: number }
  >();
  roadTiles.forEach((tiles, index) => {
    const { width } = roads[index];
    const seen = new Set<string>();

    tiles.forEach((tile, i) => {
      const key = tileKey(tile);
      const neighbours = [tiles[i - 1], tiles[i + 1]].filter(Boolean);
      const runsAlongX = neighbours.some((n) => {
        return n.y === tile.y && n.x !== tile.x;
      });
      const runsAlongY = neighbours.some((n) => {
        return n.x === tile.x && n.y !== tile.y;
      });
      const entry = roadsPerTile.get(key) ?? {
        tile,
        count: 0,
        acrossX: 0,
        acrossY: 0
      };

      roadsPerTile.set(key, {
        tile,
        count: entry.count + (seen.has(key) ? 0 : 1),
        acrossX: runsAlongY ? Math.max(entry.acrossX, width) : entry.acrossX,
        acrossY: runsAlongX ? Math.max(entry.acrossY, width) : entry.acrossY
      });
      seen.add(key);
    });
  });
  const isJunction = (tile: Coords) => {
    return (roadsPerTile.get(tileKey(tile))?.count ?? 0) > 1;
  };
  // Shift of the centre line of a road, from the centre of the tiles it covers across
  const evenShift = (width: number) => {
    const span = getRoadSpan(width);

    return (span.from + span.to) / 2;
  };

  const extend = (end: Coords, inner: Coords) => {
    const length = Math.hypot(end.x - inner.x, end.y - inner.y);

    return {
      x: end.x + ((end.x - inner.x) / length) * 0.5,
      y: end.y + ((end.y - inner.y) / length) * 0.5
    };
  };

  const roadPaths = roads
    .map(({ width, sidewalks = false }, index) => {
      const tiles = roadTiles[index];
      if (tiles.length < 2) return null;

      const corners = getPathCorners(tiles);
      const last = corners.length - 1;
      const shift = evenShift(width);
      // Corners move diagonally; the ends only move across their section so the road
      // still ends on a tile edge
      const points = corners.map((corner, i) => {
        if (i > 0 && i < last) {
          return { x: corner.x + shift, y: corner.y + shift };
        }
        const neighbour = corners[i === 0 ? 1 : last - 1];
        const isAlongX = neighbour.y === corner.y;

        return {
          x: corner.x + (isAlongX ? 0 : shift),
          y: corner.y + (isAlongX ? shift : 0)
        };
      });

      if (!isJunction(tiles[0])) points[0] = extend(points[0], points[1]);
      if (!isJunction(tiles[tiles.length - 1])) {
        points[last] = extend(points[last], points[last - 1]);
      }

      return {
        // Inner radius of half a tile on the outermost band (sidewalks included)
        d: getRoundedPathD(
          points.map(toLocal),
          ((width + (sidewalks ? SIDEWALK_WIDTH * 2 : 0) + 1) / 2) * tileSize
        ),
        width,
        sidewalks
      };
    })
    .filter(
      (road): road is { d: string; width: number; sidewalks: boolean } => {
        return road !== null;
      }
    );

  const junctions = [...roadsPerTile.values()]
    .filter(({ count }) => {
      return count > 1;
    })
    .map(({ tile, acrossX, acrossY }) => {
      // Sizes along the tile x and y axes: the crossing road widths
      return {
        position: toLocal({
          x: tile.x + evenShift(acrossX),
          y: tile.y + evenShift(acrossY)
        }),
        size: { x: acrossX, y: acrossY }
      };
    });

  return { roads: roadPaths, junctions };
};

export interface WallFace {
  points: Coords[];
  kind: 'SIDE' | 'TOP';
  // How much a side face is darkened (0.4 facing bottom left to 0.8 facing bottom right)
  shade: number;
}

// Screen-space faces of a wall with some thickness, back faces first. `corners` are the
// wall's corner tiles in order; each section between two corners is straight, at any
// angle. Sections are joined with mitred corners. Without a thickness, a wall along a
// screen-vertical diagonal would be seen edge on and disappear.
export const getWallFaces = (
  corners: Coords[],
  height: number,
  thickness: number
): WallFace[] => {
  const tiles = corners.filter((tile, index) => {
    return index === 0 || !CoordsUtils.isEqual(tile, corners[index - 1]);
  });
  if (tiles.length < 2) return [];

  const elevation = getElevation(height);
  const half = thickness / 2;
  const add = (a: Coords, b: Coords, k = 1) => {
    return { x: a.x + b.x * k, y: a.y + b.y * k };
  };
  const dot = (a: Coords, b: Coords) => {
    return a.x * b.x + a.y * b.y;
  };
  const normalise = (v: Coords) => {
    const length = Math.hypot(v.x, v.y);
    return { x: v.x / length, y: v.y / length };
  };

  const directions = tiles.slice(1).map((end, i) => {
    return normalise({ x: end.x - tiles[i].x, y: end.y - tiles[i].y });
  });
  const normals = directions.map((d) => {
    return { x: -d.y, y: d.x };
  });
  const last = tiles.length - 1;

  // Offset of the left side at each corner (the right side is the opposite)
  const offsets = tiles.map((_, v) => {
    if (v === 0) return add({ x: 0, y: 0 }, normals[0], half);
    if (v === last) return add({ x: 0, y: 0 }, normals[last - 1], half);

    const sum = add(normals[v - 1], normals[v]);
    if (Math.hypot(sum.x, sum.y) < 1e-6)
      return add({ x: 0, y: 0 }, normals[v], half);
    const mitre = normalise(sum);
    const length = Math.min(half / dot(mitre, normals[v]), thickness * 2);

    return add({ x: 0, y: 0 }, mitre, length);
  });
  const left = tiles.map((tile, v) => {
    return add(tile, offsets[v]);
  });
  const right = tiles.map((tile, v) => {
    return add(tile, offsets[v], -1);
  });

  const project = (tile: Coords) => {
    return getTilePosition({ tile });
  };
  const raise = (point: Coords) => {
    return { x: point.x, y: point.y - elevation };
  };
  // The viewer looks from the bottom of the screen, towards +x +y in tile space
  const towardsViewer = { x: -1, y: -1 };

  const sides: WallFace[] = [];
  const addSide = (from: Coords, to: Coords, outwards: Coords) => {
    if (dot(outwards, towardsViewer) <= 1e-9) return;

    const facingRight = Math.max(0, -outwards.y);
    const facingLeft = Math.max(0, -outwards.x);
    const start = project(from);
    const end = project(to);

    sides.push({
      kind: 'SIDE',
      shade: 0.4 + (0.4 * facingRight) / (facingLeft + facingRight),
      points: [start, end, raise(end), raise(start)]
    });
  };

  directions.forEach((direction, i) => {
    addSide(left[i], left[i + 1], normals[i]);
    addSide(right[i + 1], right[i], { x: -normals[i].x, y: -normals[i].y });
  });
  addSide(right[0], left[0], { x: -directions[0].x, y: -directions[0].y });
  addSide(left[last], right[last], directions[last - 1]);

  // Painter's order: where two faces overlap on screen, the one whose foot is lower there
  // is nearer
  const footY = (face: WallFace, x: number) => {
    const [start, end] = face.points;
    if (start.x === end.x) return Math.max(start.y, end.y);

    return start.y + ((end.y - start.y) * (x - start.x)) / (end.x - start.x);
  };
  sides.sort((a, b) => {
    const [a0, a1] = a.points;
    const [b0, b1] = b.points;
    const from = Math.max(Math.min(a0.x, a1.x), Math.min(b0.x, b1.x));
    const to = Math.min(Math.max(a0.x, a1.x), Math.max(b0.x, b1.x));

    if (to > from) {
      const x = (from + to) / 2;
      return footY(a, x) - footY(b, x);
    }

    return a0.y + a1.y - (b0.y + b1.y);
  });

  // The tops are all at the same height, above every side
  const tops = directions.map((_, i): WallFace => {
    return {
      kind: 'TOP',
      shade: 0,
      points: [left[i], left[i + 1], right[i + 1], right[i]].map((tile) => {
        return raise(project(tile));
      })
    };
  });

  return [...sides, ...tops];
};

export const getTextBoxEndTile = (textBox: TextBox, size: Size) => {
  if (textBox.orientation === ProjectionOrientationEnum.X) {
    return CoordsUtils.add(textBox.tile, {
      x: size.width,
      y: 0
    });
  }

  return CoordsUtils.add(textBox.tile, {
    x: 0,
    y: -size.width
  });
};

interface GetItemAtTile {
  tile: Coords;
  scene: ReturnType<typeof useScene>;
}

// Every item under the tile, the one that should be picked first first:
// - icons placed exactly on the tile, then the area covered by enlarged icons (otherwise a
//   person standing in front of a vehicle could never be selected),
// - then text boxes, connectors and rectangles.
// Within each kind, items are in layer order (index 0 is the top layer).
export const getItemsAtTile = ({
  tile,
  scene
}: GetItemAtTile): ItemReference[] => {
  const exactViewItems = scene.items.filter((item) => {
    return CoordsUtils.isEqual(item.tile, tile);
  });

  const scaledViewItems = scene.items.filter((item) => {
    // If the item has a scaleFactor > 1, check if the tile is within its bounds
    if (
      item.scaleFactor &&
      item.scaleFactor > 1 &&
      !exactViewItems.includes(item)
    ) {
      // Calculate the size of the icon in tiles based on scale factor
      // Round up to ensure we cover the full area
      const iconSize = Math.ceil(item.scaleFactor);

      // Create a bounding box for the icon
      const iconBounds = getBoundingBox([
        item.tile,
        {
          x: item.tile.x + iconSize - 1,
          y: item.tile.y + iconSize - 1
        }
      ]);

      return isWithinBounds(tile, iconBounds);
    }
    return false;
  });

  const textBoxes = scene.textBoxes.filter((tb) => {
    const textBoxTo = getTextBoxEndTile(tb, tb.size);
    const textBoxBounds = getBoundingBox([
      tb.tile,
      {
        x: Math.ceil(textBoxTo.x),
        y:
          tb.orientation === 'X'
            ? Math.ceil(textBoxTo.y)
            : Math.floor(textBoxTo.y)
      }
    ]);

    return isWithinBounds(tile, textBoxBounds);
  });

  const connectors = scene.connectors.filter((con) => {
    // Guard against connectors with undefined paths
    if (!con.path || !con.path.tiles) {
      return false;
    }

    // A wall is hit anywhere it is drawn, from its foot to its top
    return getConnectorGroundTile(con, tile) !== null;
  });

  const rectangles = scene.rectangles.filter((rectangle) => {
    return isWithinVolume(tile, rectangle);
  });
  // Volumes are drawn above flat rectangles, so they are hit first
  const sortedRectangles = [
    ...rectangles.filter(isVolume),
    ...rectangles.filter((rectangle) => {
      return !isVolume(rectangle);
    })
  ];

  return [
    ...[...exactViewItems, ...scaledViewItems].map((item): ItemReference => {
      return { type: 'ITEM', id: item.id };
    }),
    ...textBoxes.map((textBox): ItemReference => {
      return { type: 'TEXTBOX', id: textBox.id };
    }),
    ...connectors.map((connector): ItemReference => {
      return { type: 'CONNECTOR', id: connector.id };
    }),
    ...sortedRectangles.map((rectangle): ItemReference => {
      return { type: 'RECTANGLE', id: rectangle.id };
    })
  ];
};

export const getItemAtTile = (args: GetItemAtTile): ItemReference | null => {
  return getItemsAtTile(args)[0] ?? null;
};

interface FontProps {
  fontWeight: number | string;
  fontSize: number;
  fontFamily: string;
  fontStyle?: string;
}

export const getTextWidth = (text: string, fontProps: FontProps) => {
  if (!text) return 0;

  const paddingX = TEXTBOX_PADDING * UNPROJECTED_TILE_SIZE;
  const fontSizePx = toPx(fontProps.fontSize * UNPROJECTED_TILE_SIZE);
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  const fontStyle = fontProps.fontStyle || 'normal';
  context.font = `${fontStyle} ${fontProps.fontWeight} ${fontSizePx} ${fontProps.fontFamily}`;
  const metrics = context.measureText(text);

  canvas.remove();

  return (metrics.width + paddingX * 2) / UNPROJECTED_TILE_SIZE;
};

const getTextBoxFontProps = (textBox: TextBox): FontProps => {
  return {
    fontSize: textBox.fontSize ?? TEXTBOX_DEFAULTS.fontSize,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontWeight: textBox.isBold ?? TEXTBOX_DEFAULTS.isBold ? 'bold' : 'normal',
    fontStyle:
      textBox.isItalic ?? TEXTBOX_DEFAULTS.isItalic ? 'italic' : 'normal'
  };
};

export const getTextBoxDimensions = (textBox: TextBox): Size => {
  const fontProps = getTextBoxFontProps(textBox);
  const width = getTextWidth(textBox.content, fontProps);
  const height = 1;

  return { width, height };
};

export const outermostCornerPositions: TileOrigin[] = [
  'BOTTOM',
  'RIGHT',
  'TOP',
  'LEFT'
];

export const convertBoundsToNamedAnchors = (
  boundingBox: BoundingBox
): {
  [key in AnchorPosition]: Coords;
} => {
  return {
    BOTTOM_LEFT: boundingBox[0],
    BOTTOM_RIGHT: boundingBox[1],
    TOP_RIGHT: boundingBox[2],
    TOP_LEFT: boundingBox[3]
  };
};

export const getAnchorAtTile = (tile: Coords, anchors: ConnectorAnchor[]) => {
  return anchors.find((anchor) => {
    return Boolean(
      anchor.ref.tile && CoordsUtils.isEqual(anchor.ref.tile, tile)
    );
  });
};

export const getAnchorParent = (anchorId: string, connectors: Connector[]) => {
  const connector = connectors.find((con) => {
    return con.anchors.find((anchor) => {
      return anchor.id === anchorId;
    });
  });

  if (!connector) {
    throw new Error(`Could not find connector with anchor id ${anchorId}`);
  }

  return connector;
};

export const getTileScrollPosition = (
  tile: Coords,
  origin?: TileOrigin
): Coords => {
  const tilePosition = getTilePosition({ tile, origin });

  return {
    x: -tilePosition.x,
    y: -tilePosition.y
  };
};

export const getConnectorsByViewItem = (
  viewItemId: string,
  connectors: Connector[]
) => {
  return connectors.filter((connector) => {
    return connector.anchors.find((anchor) => {
      return anchor.ref.item === viewItemId;
    });
  });
};

export const getConnectorDirectionIcon = (connectorTiles: Coords[]) => {
  if (connectorTiles.length < 2) return null;

  const iconTile = connectorTiles[connectorTiles.length - 2];
  const lastTile = connectorTiles[connectorTiles.length - 1];

  let rotation;

  if (lastTile.x > iconTile.x) {
    if (lastTile.y > iconTile.y) {
      rotation = 135;
    } else if (lastTile.y < iconTile.y) {
      rotation = 45;
    } else {
      rotation = 90;
    }
  }

  if (lastTile.x < iconTile.x) {
    if (lastTile.y > iconTile.y) {
      rotation = -135;
    } else if (lastTile.y < iconTile.y) {
      rotation = -45;
    } else {
      rotation = -90;
    }
  }

  if (lastTile.x === iconTile.x) {
    if (lastTile.y > iconTile.y) {
      rotation = 180;
    } else if (lastTile.y < iconTile.y) {
      rotation = 0;
    } else {
      rotation = -90;
    }
  }

  return {
    x: iconTile.x * UNPROJECTED_TILE_SIZE + UNPROJECTED_TILE_SIZE / 2,
    y: iconTile.y * UNPROJECTED_TILE_SIZE + UNPROJECTED_TILE_SIZE / 2,
    rotation
  };
};

export const getProjectBounds = (
  view: View,
  padding = PROJECT_BOUNDING_BOX_PADDING
): Coords[] => {
  const itemTiles = view.items.map((item) => {
    return item.tile;
  });

  const connectors = view.connectors ?? [];
  const connectorTiles = connectors.reduce<Coords[]>((acc, connector) => {
    const path = getConnectorPath({
      anchors: connector.anchors,
      view,
      routing: getConnectorRouting(connector)
    });
    const offset = getElevationTileOffset(getWallHeight(connector));
    // Roads spread on both sides of their path
    const margin = isRoad(connector)
      ? Math.ceil(getRoadOuterWidth(connector) / 2)
      : 0;

    return [
      ...acc,
      ...getBoundingBox([path.rectangle.from, path.rectangle.to], {
        x: margin,
        y: margin
      }),
      CoordsUtils.add(path.rectangle.from, offset),
      CoordsUtils.add(path.rectangle.to, offset)
    ];
  }, []);

  const rectangles = view.rectangles ?? [];
  const rectangleTiles = rectangles.reduce<Coords[]>((acc, rectangle) => {
    const offset = getElevationTileOffset(
      isVolume(rectangle) ? rectangle.height : 0
    );

    return [
      ...acc,
      rectangle.from,
      rectangle.to,
      CoordsUtils.add(rectangle.from, offset),
      CoordsUtils.add(rectangle.to, offset)
    ];
  }, []);

  const textBoxes = view.textBoxes ?? [];
  const textBoxTiles = textBoxes.reduce<Coords[]>((acc, textBox) => {
    const size = getTextBoxDimensions(textBox);

    return [
      ...acc,
      textBox.tile,
      CoordsUtils.add(textBox.tile, {
        x: size.width,
        y: size.height
      })
    ];
  }, []);

  let allTiles = [
    ...itemTiles,
    ...connectorTiles,
    ...rectangleTiles,
    ...textBoxTiles
  ];

  if (allTiles.length === 0) {
    const centerTile = CoordsUtils.zero();
    allTiles = [centerTile, centerTile, centerTile, centerTile];
  }

  const corners = getBoundingBox(allTiles, {
    x: padding,
    y: padding
  });

  return corners;
};

export const getUnprojectedBounds = (view: View) => {
  const projectBounds = getProjectBounds(view);

  const cornerPositions = projectBounds.map((corner) => {
    return getTilePosition({
      tile: corner
    });
  });
  const sortedCorners = sortByPosition(cornerPositions);
  const topLeft = { x: sortedCorners.lowX, y: sortedCorners.lowY };
  const size = getBoundingBoxSize(cornerPositions);

  return {
    width: size.width,
    height: size.height,
    x: topLeft.x,
    y: topLeft.y
  };
};

export const getFitToViewParams = (view: View, viewportSize: Size) => {
  const projectBounds = getProjectBounds(view);
  const sortedCornerPositions = sortByPosition(projectBounds);
  const boundingBoxSize = getBoundingBoxSize(projectBounds);
  const unprojectedBounds = getUnprojectedBounds(view);
  const zoom = clamp(
    Math.min(
      viewportSize.width / unprojectedBounds.width,
      viewportSize.height / unprojectedBounds.height
    ),
    0,
    MAX_ZOOM
  );
  const scrollTarget: Coords = {
    x: (sortedCornerPositions.lowX + boundingBoxSize.width / 2) * zoom,
    y: (sortedCornerPositions.lowY + boundingBoxSize.height / 2) * zoom
  };
  const scroll = getTileScrollPosition(scrollTarget);

  return {
    zoom,
    scroll
  };
};
