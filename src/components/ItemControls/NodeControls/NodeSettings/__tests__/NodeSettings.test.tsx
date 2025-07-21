import React from 'react';
import {render, screen} from '@testing-library/react';
import {NodeSettings} from '../NodeSettings';
import {ViewItem} from 'src/types';
import {ModelProvider} from 'src/stores/modelStore';
import {SceneProvider} from 'src/stores/sceneStore';
import {UiStateProvider} from 'src/stores/uiStateStore';

// Mock the hooks
jest.mock('src/hooks/useModelItem', () => ({
  useModelItem: jest.fn(() => ({
    id: 'test-id',
    name: 'Test Node',
    icon: 'test-icon',
    description: ''
  }))
}));

jest.mock('src/hooks/useIcon', () => ({
  useIcon: jest.fn(() => ({
    icon: {
      id: 'test-icon',
      scaleFactor: 0.5,
      colorizable: true
    }
  }))
}));

jest.mock('src/hooks/useTranslation', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key
  }))
}));

jest.mock('src/components/MarkdownEditor/MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }: any) => {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        data-testid="markdown-editor"
      />
    );
  }
}));

describe('NodeSettings', () => {
  const mockNode: ViewItem = {
    id: 'test-id',
    tile: { x: 0, y: 0 },
    labelHeight: 80,
    mirrorHorizontal: false,
    mirrorVertical: false,
    // scaleFactor is undefined to test the fallback behavior
  };

  const mockProps = {
    node: mockNode,
    onModelItemUpdated: jest.fn(),
    onViewItemUpdated: jest.fn(),
    onDeleted: jest.fn(),
    onDuplicated: jest.fn()
  };

  it('should display icon scaleFactor when node scaleFactor is undefined', () => {
    render(
      <ModelProvider>
        <SceneProvider>
          <UiStateProvider>
            <NodeSettings {...mockProps} />
          </UiStateProvider>
        </SceneProvider>
      </ModelProvider>
    );

      // The scale input should show 0.50 (formatted from icon.scaleFactor) instead of 1
      const scaleInputs = screen.getAllByDisplayValue('0.50');
    const numberInput = scaleInputs.find(input => input.getAttribute('type') === 'number');
    expect(numberInput).toBeInTheDocument();
  });

  it('should display node scaleFactor when it is defined', () => {
    const nodeWithScale = {
      ...mockNode,
      scaleFactor: 1.5
    };

    render(
      <ModelProvider>
        <SceneProvider>
          <UiStateProvider>
            <NodeSettings {...mockProps} node={nodeWithScale} />
          </UiStateProvider>
        </SceneProvider>
      </ModelProvider>
    );

    // The scale input should show 1.5 (from node.scaleFactor)
    const scaleInputs = screen.getAllByDisplayValue('1.5');
    const numberInput = scaleInputs.find(input => input.getAttribute('type') === 'number');
    expect(numberInput).toBeInTheDocument();
  });
});
