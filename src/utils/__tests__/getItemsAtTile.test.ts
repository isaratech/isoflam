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
