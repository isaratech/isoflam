import { isItemLocked } from '../renderer';

const scene = {
  items: [
    { id: 'locked-icon', tile: { x: 0, y: 0 }, locked: true },
    { id: 'icon', tile: { x: 1, y: 0 } }
  ],
  rectangles: [{ id: 'zone', from: { x: 0, y: 0 }, to: { x: 1, y: 1 } }],
  textBoxes: [{ id: 'text', tile: { x: 0, y: 0 }, locked: true }],
  connectors: [
    {
      id: 'wall',
      locked: true,
      anchors: [{ id: 'wall-anchor', ref: { tile: { x: 0, y: 0 } } }]
    }
  ]
} as any;

describe('isItemLocked', () => {
  it('reads the lock of every kind of item', () => {
    expect(isItemLocked({ type: 'ITEM', id: 'locked-icon' }, scene)).toBe(true);
    expect(isItemLocked({ type: 'TEXTBOX', id: 'text' }, scene)).toBe(true);
    expect(isItemLocked({ type: 'CONNECTOR', id: 'wall' }, scene)).toBe(true);
  });

  it('treats an item without a lock as unlocked', () => {
    expect(isItemLocked({ type: 'ITEM', id: 'icon' }, scene)).toBe(false);
    expect(isItemLocked({ type: 'RECTANGLE', id: 'zone' }, scene)).toBe(false);
  });

  it('locks the anchors of a locked connector', () => {
    expect(
      isItemLocked({ type: 'CONNECTOR_ANCHOR', id: 'wall-anchor' }, scene)
    ).toBe(true);
  });
});
