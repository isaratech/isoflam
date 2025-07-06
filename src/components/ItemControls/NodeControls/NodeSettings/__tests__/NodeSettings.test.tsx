import React from 'react';
import { render, screen } from '@testing-library/react';
import { NodeSettings } from '../NodeSettings';
import { ViewItem, ModelItem } from 'src/types';

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
    render(<NodeSettings {...mockProps} />);

    // The scale input should show 0.5 (from icon.scaleFactor) instead of 1
    const scaleInput = screen.getByDisplayValue('0.5');
    expect(scaleInput).toBeInTheDocument();
  });

  it('should display node scaleFactor when it is defined', () => {
    const nodeWithScale = {
      ...mockNode,
      scaleFactor: 1.5
    };

    render(<NodeSettings {...mockProps} node={nodeWithScale} />);

    // The scale input should show 1.5 (from node.scaleFactor)
    const scaleInput = screen.getByDisplayValue('1.5');
    expect(scaleInput).toBeInTheDocument();
  });
});
