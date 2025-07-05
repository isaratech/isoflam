import React from 'react';
import { render, screen } from '@testing-library/react';
import { RectangleControls } from '../RectangleControls';

// Create a mock function that can be configured per test
const mockUseRectangle = jest.fn();

jest.mock('src/hooks/useRectangle', () => ({
  useRectangle: mockUseRectangle
}));

jest.mock('src/hooks/useScene', () => ({
  useScene: () => ({
    updateRectangle: jest.fn(),
    deleteRectangle: jest.fn(),
    createRectangle: jest.fn()
  })
}));

jest.mock('src/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

jest.mock('src/stores/uiStateStore', () => ({
  useUiStateStore: () => ({
    actions: {
      setItemControls: jest.fn()
    }
  })
}));

// Mock the ColorSelector component
jest.mock('src/components/ColorSelector/ColorSelector', () => ({
  ColorSelector: () => <div data-testid="color-selector" />
}));

describe('RectangleControls', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('shows width control when style is SOLID', () => {
    mockUseRectangle.mockReturnValue({
      id: 'test-rectangle',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 },
      color: 'red',
      style: 'SOLID',
      width: 1,
      radius: 22
    });

    render(<RectangleControls id="test-rectangle" />);

    expect(screen.getByText('Width')).toBeInTheDocument();
  });

  it('hides width control when style is NONE', () => {
    mockUseRectangle.mockReturnValue({
      id: 'test-rectangle',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 },
      color: 'red',
      style: 'NONE',
      width: 1,
      radius: 22
    });

    render(<RectangleControls id="test-rectangle" />);

    expect(screen.queryByText('Width')).not.toBeInTheDocument();
  });

  it('shows width control when style is DOTTED', () => {
    mockUseRectangle.mockReturnValue({
      id: 'test-rectangle',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 },
      color: 'red',
      style: 'DOTTED',
      width: 1,
      radius: 22
    });

    render(<RectangleControls id="test-rectangle" />);

    expect(screen.getByText('Width')).toBeInTheDocument();
  });

  it('shows width control when style is DASHED', () => {
    mockUseRectangle.mockReturnValue({
      id: 'test-rectangle',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 },
      color: 'red',
      style: 'DASHED',
      width: 1,
      radius: 22
    });

    render(<RectangleControls id="test-rectangle" />);

    expect(screen.getByText('Width')).toBeInTheDocument();
  });
});
