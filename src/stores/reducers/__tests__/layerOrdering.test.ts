import { produce } from 'immer';
import { model as modelFixture } from 'src/fixtures/model';
import { ItemReference } from 'src/types';
import * as reducers from 'src/stores/reducers';

const getModel = () => {
  return produce(modelFixture, (draft) => {
    draft.views[0].rectangles = [
      {
        id: 'rect1',
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 }
      },
      {
        id: 'rect2',
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 }
      },
      {
        id: 'rect3',
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 }
      }
    ];
  });
};

const scene = {
  connectors: {},
  textBoxes: {}
};

describe('Layer ordering reducers works correctly', () => {
  test('Brings layer forwards correctly', () => {
    const model = getModel();
    const item: ItemReference = {
      type: 'RECTANGLE',
      id: 'rect3'
    };

    const result = reducers.view({
      action: 'CHANGE_LAYER_ORDER',
      payload: {
        action: 'BRING_FORWARD',
        item
      },
      ctx: {
        viewId: 'view1',
        state: { model, scene }
      }
    });

    expect(result.model.views[0].rectangles?.[1].id).toBe('rect3');
  });

  test('Brings layer to front correctly', () => {
    const model = getModel();
    const item: ItemReference = {
      type: 'RECTANGLE',
      id: 'rect3'
    };

    const result = reducers.view({
      action: 'CHANGE_LAYER_ORDER',
      payload: {
        action: 'BRING_TO_FRONT',
        item
      },
      ctx: {
        viewId: 'view1',
        state: { model, scene }
      }
    });

    expect(result.model.views[0].rectangles?.[0].id).toBe('rect3');
  });

  test('Sends layer backward correctly', () => {
    const model = getModel();
    const item: ItemReference = {
      type: 'RECTANGLE',
      id: 'rect1'
    };

    const result = reducers.view({
      action: 'CHANGE_LAYER_ORDER',
      payload: {
        action: 'SEND_BACKWARD',
        item
      },
      ctx: {
        viewId: 'view1',
        state: { model, scene }
      }
    });

    expect(result.model.views[0].rectangles?.[1].id).toBe('rect1');
  });

  test('Sends layer to back correctly', () => {
    const model = getModel();
    const item: ItemReference = {
      type: 'RECTANGLE',
      id: 'rect1'
    };

    const result = reducers.view({
      action: 'CHANGE_LAYER_ORDER',
      payload: {
        action: 'SEND_TO_BACK',
        item
      },
      ctx: {
        viewId: 'view1',
        state: { model, scene }
      }
    });

    expect(result.model.views[0].rectangles?.[2].id).toBe('rect1');
  });

  const changeIconLayer = (
    action:
      | 'BRING_FORWARD'
      | 'SEND_BACKWARD'
      | 'BRING_TO_FRONT'
      | 'SEND_TO_BACK',
    id: string,
    model = getModel()
  ) => {
    return reducers.view({
      action: 'CHANGE_LAYER_ORDER',
      payload: { action, item: { type: 'ITEM', id } },
      ctx: { viewId: 'view1', state: { model, scene } }
    }).model;
  };

  test('Moves an icon up and down by one layer', () => {
    const forward = changeIconLayer('BRING_FORWARD', 'node1');
    expect(forward.views[0].items[0].layer).toBe(1);

    const backward = changeIconLayer('SEND_BACKWARD', 'node1', forward);
    expect(backward.views[0].items[0].layer).toBe(0);
  });

  test('Brings an icon above, or sends it below, every other icon', () => {
    const raised = changeIconLayer('BRING_FORWARD', 'node2');
    const front = changeIconLayer('BRING_TO_FRONT', 'node1', raised);
    expect(front.views[0].items[0].layer).toBe(2);

    const back = changeIconLayer('SEND_TO_BACK', 'node3', front);
    expect(back.views[0].items[2].layer).toBe(-1);
    // The icons keep their order in the list
    expect(
      back.views[0].items.map(({ id }) => {
        return id;
      })
    ).toEqual(['node1', 'node2', 'node3']);
  });
});
