import { createViewItem } from '../viewItem';
import { State } from '../types';
import { generateId } from 'src/utils';

describe('viewItem reducer', () => {
  const mockState: State = {
    model: {
      title: 'Test Model',
      icons: [],
      colors: [],
      items: [], // Empty items array - this will cause the validation error
      views: [
        {
          id: 'test-view',
          name: 'Test View',
          items: [],
          connectors: [],
          textBoxes: [],
          rectangles: []
        }
      ]
    },
    scene: {
      connectors: {},
      textBoxes: {}
    }
  };

  it('should automatically create model item when creating view item that references non-existent model item', () => {
    const viewItemId = generateId();
    const newViewItem = {
      id: viewItemId, // This ID doesn't exist in model.items
      tile: { x: 0, y: 0 },
      mirrorHorizontal: false,
      mirrorVertical: false
    };

    const ctx = {
      viewId: 'test-view',
      state: mockState
    };

    // Should not throw error anymore, should automatically create the model item
    const result = createViewItem(newViewItem, ctx);

    // Verify that the model item was created
    const createdModelItem = result.model.items.find(item => item.id === viewItemId);
    expect(createdModelItem).toBeDefined();
    expect(createdModelItem?.icon).toBeUndefined();

    // Verify that the view item was created
    const view = result.model.views.find(v => v.id === 'test-view');
    expect(view?.items).toHaveLength(1);
    expect(view?.items[0].id).toBe(viewItemId);
  });

  it('should successfully create view item when model item exists', () => {
    const viewItemId = generateId();
    const modelItemId = generateId();

    // Add model item first
    const stateWithModelItem: State = {
      ...mockState,
      model: {
        ...mockState.model,
        items: [
          {
            id: modelItemId,
            name: 'Test Model Item'
          }
        ]
      }
    };

    const newViewItem = {
      id: modelItemId, // Reference the existing model item
      tile: { x: 0, y: 0 },
      mirrorHorizontal: false,
      mirrorVertical: false
    };

    const ctx = {
      viewId: 'test-view',
      state: stateWithModelItem
    };

    expect(() => {
      createViewItem(newViewItem, ctx);
    }).not.toThrow();
  });
});
