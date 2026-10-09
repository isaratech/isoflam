import { getItemAtTile, getItemsAtTile } from '../renderer';

const scene = {
  items: [
    { id: 'vehicle', tile: { x: 0, y: 0 }, scaleFactor: 2 },
    { id: 'person', tile: { x: 1, y: 1 }, scaleFactor: 0.5 }
  ],
  textBoxes: [],
  connectors: [],
  rectangles: [{ id: 'zone', from: { x: -5, y: -5 }, to: { x: 5, y: 5 } }]
} as any;

describe('getItemsAtTile', () => {
  it('picks an icon placed on the tile before an enlarged icon covering it', () => {
    expect(getItemAtTile({ tile: { x: 1, y: 1 }, scene })).toEqual({
      type: 'ITEM',
      id: 'person'
    });
  });

  it('lists every item under the tile, top-most first', () => {
    expect(getItemsAtTile({ tile: { x: 1, y: 1 }, scene })).toEqual([
      { type: 'ITEM', id: 'person' },
      { type: 'ITEM', id: 'vehicle' },
      { type: 'RECTANGLE', id: 'zone' }
    ]);
  });

  it('returns null when nothing is under the tile', () => {
    expect(getItemAtTile({ tile: { x: 20, y: 20 }, scene })).toBeNull();
  });
});

describe('getItemsAtTile with walls and roads', () => {
  // Both run along the ground tiles (3,0) -> (0,0); the wall is 2 tiles high
  const path = {
    tiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 }
    ],
    rectangle: { from: { x: 3, y: 0 }, to: { x: 0, y: 0 } }
  };
  const wallScene = {
    items: [],
    textBoxes: [],
    rectangles: [],
    connectors: [{ id: 'wall', height: 2, path }]
  } as any;
  const roadScene = {
    ...wallScene,
    connectors: [{ id: 'road', height: 2, variant: 'ROAD', path }]
  } as any;

  it('hits a wall anywhere from its foot to its top', () => {
    [
      { x: 3, y: 0 },
      { x: 4, y: 1 },
      { x: 5, y: 2 }
    ].forEach((tile) => {
      expect(getItemAtTile({ tile, scene: wallScene })).toEqual({
        type: 'CONNECTOR',
        id: 'wall'
      });
    });
  });

  it('does not hit beside a wall', () => {
    expect(
      getItemAtTile({ tile: { x: 0, y: 2 }, scene: wallScene })
    ).toBeNull();
  });

  it('hits a road across its whole width, sidewalks included', () => {
    // Default width 4: the tiles from 1 below to 2 above the path
    expect(getItemAtTile({ tile: { x: 1, y: 2 }, scene: roadScene })).toEqual({
      type: 'CONNECTOR',
      id: 'road'
    });
    expect(
      getItemAtTile({ tile: { x: 1, y: 3 }, scene: roadScene })
    ).toBeNull();

    const withSidewalks = {
      ...roadScene,
      connectors: [{ ...roadScene.connectors[0], sidewalks: true }]
    };
    expect(
      getItemAtTile({ tile: { x: 1, y: 3 }, scene: withSidewalks })
    ).toEqual({ type: 'CONNECTOR', id: 'road' });
  });

  it('does not hit beyond the end of a road', () => {
    expect(
      getItemAtTile({ tile: { x: 4, y: 0 }, scene: roadScene })
    ).toBeNull();
    expect(
      getItemAtTile({ tile: { x: -1, y: 1 }, scene: roadScene })
    ).toBeNull();
  });

  it('only hits a road on the ground, whatever its height', () => {
    expect(getItemAtTile({ tile: { x: 3, y: 0 }, scene: roadScene })).toEqual({
      type: 'CONNECTOR',
      id: 'road'
    });
    expect(
      getItemAtTile({ tile: { x: 7, y: 4 }, scene: roadScene })
    ).toBeNull();
  });
});

describe('getItemsAtTile with volumes', () => {
  const volumeScene = {
    items: [],
    textBoxes: [],
    connectors: [],
    rectangles: [
      { id: 'flat', from: { x: 0, y: 0 }, to: { x: 3, y: 3 } },
      { id: 'volume', from: { x: 1, y: 1 }, to: { x: 2, y: 2 }, height: 2 },
      {
        id: 'road',
        from: { x: 10, y: 10 },
        to: { x: 12, y: 10 },
        height: 2,
        texture: 'ROAD'
      }
    ]
  } as any;

  it('picks a volume before the flat rectangle it stands on', () => {
    expect(
      getItemsAtTile({ tile: { x: 1, y: 1 }, scene: volumeScene })
    ).toEqual([
      { type: 'RECTANGLE', id: 'volume' },
      { type: 'RECTANGLE', id: 'flat' }
    ]);
  });

  it('hits a volume on its raised part', () => {
    expect(getItemAtTile({ tile: { x: 4, y: 4 }, scene: volumeScene })).toEqual(
      { type: 'RECTANGLE', id: 'volume' }
    );
  });

  it('ignores the height of a textured rectangle, which is drawn flat', () => {
    expect(
      getItemAtTile({ tile: { x: 14, y: 12 }, scene: volumeScene })
    ).toBeNull();
  });
});
