import React from 'react';
import { render } from '@testing-library/react';
import { Rectangle } from '../Rectangle';

// Mock the hooks
jest.mock('src/hooks/useColor', () => {
  return {
    useColor: () => {
      return { value: '#ff0000' };
    }
  };
});

jest.mock('src/utils', () => {
  return {
    getColorVariant: () => {
      return '#cc0000';
    }
  };
});

// Mock IsoTileArea component
jest.mock('src/components/IsoTileArea/IsoTileArea', () => {
  return {
    IsoTileArea: ({ stroke, cornerRadius, ...props }: any) => {
      return (
        <div
          data-testid="iso-tile-area"
          data-stroke={stroke ? JSON.stringify(stroke) : 'none'}
          data-corner-radius={cornerRadius}
          {...props}
        />
      );
    }
  };
});

jest.mock('../Volume', () => {
  return {
    Volume: ({ height, roof }: any) => {
      return (
        <div data-testid="volume" data-height={height} data-roof={`${roof}`} />
      );
    }
  };
});

describe('Rectangle', () => {
  const defaultProps = {
    id: 'test-rectangle',
    from: { x: 0, y: 0 },
    to: { x: 2, y: 2 },
    color: 'red',
    style: 'SOLID' as const,
    width: 1,
    radius: 22,
    imageData: undefined,
    imageName: undefined,
    mirrorHorizontal: false,
    mirrorVertical: false,
    rotationAngle: 0,
    height: 0,
    roof: true
  };

  it('renders a volume instead of a flat area when it has a height', () => {
    const { getByTestId, queryByTestId } = render(
      <Rectangle {...defaultProps} height={2} roof={false} />
    );

    const volume = getByTestId('volume');
    expect(volume.getAttribute('data-height')).toBe('2');
    expect(volume.getAttribute('data-roof')).toBe('false');
    expect(queryByTestId('iso-tile-area')).toBeNull();
  });

  it('renders without stroke when style is NONE', () => {
    const { getByTestId } = render(
      <Rectangle {...defaultProps} style="NONE" />
    );

    const element = getByTestId('iso-tile-area');
    expect(element.getAttribute('data-stroke')).toBe('none');
  });

  it('renders with stroke when style is SOLID', () => {
    const { getByTestId } = render(
      <Rectangle {...defaultProps} style="SOLID" />
    );

    const element = getByTestId('iso-tile-area');
    const strokeData = JSON.parse(element.getAttribute('data-stroke') || '{}');
    expect(strokeData.style).toBe('SOLID');
    expect(strokeData.width).toBe(1);
  });

  it('renders with stroke when style is DASHED', () => {
    const { getByTestId } = render(
      <Rectangle {...defaultProps} style="DASHED" />
    );

    const element = getByTestId('iso-tile-area');
    const strokeData = JSON.parse(element.getAttribute('data-stroke') || '{}');
    expect(strokeData.style).toBe('DASHED');
  });

  it('renders without stroke when using default style (NONE)', () => {
    const { getByTestId } = render(
      <Rectangle {...defaultProps} style="NONE" />
    );

    const element = getByTestId('iso-tile-area');
    expect(element.getAttribute('data-stroke')).toBe('none');
  });

  it('renders with custom width when specified', () => {
    const { getByTestId } = render(
      <Rectangle {...defaultProps} style="SOLID" width={3} />
    );

    const element = getByTestId('iso-tile-area');
    const strokeData = JSON.parse(element.getAttribute('data-stroke') || '{}');
    expect(strokeData.width).toBe(3);
  });

  it('renders with default radius when radius is specified', () => {
    const { getByTestId } = render(<Rectangle {...defaultProps} />);

    const element = getByTestId('iso-tile-area');
    expect(element.getAttribute('data-corner-radius')).toBe('22');
  });

  it('renders with custom radius when specified', () => {
    const { getByTestId } = render(<Rectangle {...defaultProps} radius={10} />);

    const element = getByTestId('iso-tile-area');
    expect(element.getAttribute('data-corner-radius')).toBe('10');
  });
});
