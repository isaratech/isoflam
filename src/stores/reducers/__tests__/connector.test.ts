import { produce } from 'immer';
import { model } from 'src/fixtures/model';
import { syncScene } from '../view';
import { deleteConnector } from '../connector';
import { deleteTextBox } from '../textBox';
import { State } from '../types';

describe('scene cleanup on delete', () => {
  const getState = (): State => {
    return syncScene({
      viewId: 'view1',
      state: { model, scene: { connectors: {}, textBoxes: {} } }
    });
  };

  it('removes the connector path from the scene', () => {
    const state = getState();
    expect(state.scene.connectors.connector1).toBeDefined();

    const newState = deleteConnector('connector1', { viewId: 'view1', state });

    expect(newState.scene.connectors.connector1).toBeUndefined();
    expect(newState.scene.connectors.connector2).toBeDefined();
  });

  it('removes the text box size from the scene', () => {
    // Text box sizes need a canvas to be measured (unavailable in jsdom): set it directly
    const withTextBox = produce(getState(), (draft) => {
      draft.model.views[0].textBoxes = [
        { id: 'textBox1', tile: { x: 0, y: 0 }, content: 'Hello' }
      ];
      draft.scene.textBoxes.textBox1 = { size: { width: 1, height: 1 } };
    });
    expect(withTextBox.scene.textBoxes.textBox1).toBeDefined();

    const newState = deleteTextBox('textBox1', {
      viewId: 'view1',
      state: withTextBox
    });

    expect(newState.scene.textBoxes.textBox1).toBeUndefined();
  });
});
