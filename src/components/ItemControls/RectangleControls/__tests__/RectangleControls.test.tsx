import React from 'react';
import {render, screen} from '@testing-library/react';
import {RectangleControls} from '../RectangleControls';
import {useRectangle} from 'src/hooks/useRectangle';

jest.mock('src/hooks/useRectangle', () => ({
  useRectangle: jest.fn()
}));

const mockUseRectangle = useRectangle as jest.MockedFunction<typeof useRectangle>;

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
        radius: 22,
        imageData: undefined,
        imageName: undefined,
        mirrorHorizontal: false,
        mirrorVertical: false,
        rotationAngle: 0
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
        radius: 22,
        imageData: undefined,
        imageName: undefined,
        mirrorHorizontal: false,
        mirrorVertical: false,
        rotationAngle: 0
    });

    render(<RectangleControls id="test-rectangle" />);

    expect(screen.queryByText('Width')).not.toBeInTheDocument();
  });

  it('shows width control when style is DASHED', () => {
    mockUseRectangle.mockReturnValue({
      id: 'test-rectangle',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 },
      color: 'red',
      style: 'DASHED',
      width: 1,
        radius: 22,
        imageData: undefined,
        imageName: undefined,
        mirrorHorizontal: false,
        mirrorVertical: false,
        rotationAngle: 0
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
        radius: 22,
        imageData: undefined,
        imageName: undefined,
        mirrorHorizontal: false,
        mirrorVertical: false,
        rotationAngle: 0
    });

    render(<RectangleControls id="test-rectangle" />);

    expect(screen.getByText('Width')).toBeInTheDocument();
  });

    it('shows color selector for regular rectangles', () => {
        mockUseRectangle.mockReturnValue({
            id: 'test-rectangle',
            from: {x: 0, y: 0},
            to: {x: 2, y: 2},
            color: 'red',
            style: 'SOLID',
            width: 1,
            radius: 22,
            imageData: undefined,
            imageName: undefined,
            mirrorHorizontal: false,
            mirrorVertical: false,
            rotationAngle: 0
        });

        render(<RectangleControls id="test-rectangle"/>);

        expect(screen.getByTestId('color-selector')).toBeInTheDocument();
    });

    it('hides color selector for image rectangles', () => {
        mockUseRectangle.mockReturnValue({
            id: 'test-rectangle',
            from: {x: 0, y: 0},
            to: {x: 2, y: 2},
            color: 'red',
            style: 'SOLID',
            width: 1,
            radius: 22,
            imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            imageName: 'test.png',
            mirrorHorizontal: false,
            mirrorVertical: false,
            rotationAngle: 0
        });

        render(<RectangleControls id="test-rectangle"/>);

        expect(screen.queryByTestId('color-selector')).not.toBeInTheDocument();
    });
});
