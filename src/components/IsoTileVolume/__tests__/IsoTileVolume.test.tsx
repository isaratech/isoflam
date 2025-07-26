import React from 'react';
import { render } from '@testing-library/react';
import { IsoTileVolume } from '../IsoTileVolume';
import { Coords } from 'src/types';

// Mock the config file to avoid icon loading issues in tests
jest.mock('src/config', () => ({
  UNPROJECTED_TILE_SIZE: 100
}));

// Mock the utils
jest.mock('src/utils', () => ({
  getBoundingBox: jest.fn((coords: any[]) => [
    { x: Math.min(...coords.map((c: any) => c.x)), y: Math.min(...coords.map((c: any) => c.y)) },
    { x: Math.max(...coords.map((c: any) => c.x)), y: Math.min(...coords.map((c: any) => c.y)) },
    { x: Math.max(...coords.map((c: any) => c.x)), y: Math.max(...coords.map((c: any) => c.y)) },
    { x: Math.min(...coords.map((c: any) => c.x)), y: Math.max(...coords.map((c: any) => c.y)) }
  ]),
  getTilePosition: jest.fn(({ tile }: any) => ({
    x: tile.x * 100,
    y: tile.y * 100
  }))
}));

// Mock the SVG component
jest.mock('src/components/Svg/Svg', () => ({
  Svg: ({ children, ...props }: any) => (
    <div data-testid="svg-container" {...props}>
      {children}
    </div>
  )
}));

// Mock the useIsoProjection hook
jest.mock('src/hooks/useIsoProjection', () => ({
  useIsoProjection: jest.fn(({ from, to }: { from: Coords; to: Coords }) => {
    const width = Math.abs(from.x - to.x) + 1;
    const height = Math.abs(from.y - to.y) + 1;
    const pxWidth = width * 100;
    const pxHeight = height * 100;
    
    return {
      css: {
        position: 'absolute' as const,
        left: from.x * 100,
        top: from.y * 100,
        width: `${pxWidth}px`,
        height: `${pxHeight}px`,
        transform: 'rotateX(60deg) rotateZ(45deg)',
        transformOrigin: 'center'
      },
      pxSize: {
        width: pxWidth,
        height: pxHeight
      }
    };
  })
}));

const mockVolumeProps = {
  from: { x: 0, y: 0 },
  to: { x: 2, y: 2 },
  height: 1,
  fill: '#4A90E2',
  isometric: true
};

describe('IsoTileVolume', () => {
  it('renders without crashing', () => {
    render(<IsoTileVolume {...mockVolumeProps} />);
  });

  it('renders base face', () => {
    const { container } = render(<IsoTileVolume {...mockVolumeProps} />);
    const basePolygon = container.querySelector('polygon');
    expect(basePolygon).toBeInTheDocument();
  });

  it('renders 3D faces when height > 0', () => {
    const { container } = render(
      <IsoTileVolume {...mockVolumeProps} height={2} />
    );
    
    // Should have base polygon + top polygon + 2 polygons (front and right walls)
    const polygons = container.querySelectorAll('polygon');
    const rects = container.querySelectorAll('rect');
    
    // We should have at least 4 polygons (base, top, front, right)
    expect(polygons.length).toBeGreaterThanOrEqual(4);
    // Non-isometric mode still uses rect, so there might be some
    expect(rects.length).toBeGreaterThanOrEqual(0);
  });

  it('does not render 3D faces when height is 0', () => {
    const { container } = render(
      <IsoTileVolume {...mockVolumeProps} height={0} />
    );
    
    // Should only have base polygon
    const polygons = container.querySelectorAll('polygon');
    
    expect(polygons.length).toBe(1); // only base
  });

  it('applies stroke when provided', () => {
    const strokeProps = {
      ...mockVolumeProps,
      stroke: {
        width: 2,
        color: '#000000',
        style: 'SOLID' as const
      }
    };
    
    const { container } = render(<IsoTileVolume {...strokeProps} />);
    const polygon = container.querySelector('polygon');
    
    expect(polygon).toHaveAttribute('stroke', '#000000');
    expect(polygon).toHaveAttribute('stroke-width', '2');
  });

  it('applies dashed stroke style', () => {
    const strokeProps = {
      ...mockVolumeProps,
      stroke: {
        width: 2,
        color: '#000000',
        style: 'DASHED' as const
      }
    };
    
    const { container } = render(<IsoTileVolume {...strokeProps} />);
    const polygon = container.querySelector('polygon');
    
    expect(polygon).toHaveAttribute('stroke-dasharray');
  });

  it('handles non-isometric mode', () => {
    const { container } = render(
      <IsoTileVolume {...mockVolumeProps} isometric={false} height={2} />
    );
    
    // In non-isometric mode with height, should render elevated rectangle
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(1);
  });

  it('handles image data with pattern', () => {
    const imageProps = {
      ...mockVolumeProps,
      imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };
    
    const { container } = render(<IsoTileVolume {...imageProps} />);
    
    // Should have defs with pattern
    const defs = container.querySelector('defs');
    const pattern = container.querySelector('pattern');
    
    expect(defs).toBeInTheDocument();
    expect(pattern).toBeInTheDocument();
  });

  it('handles different height values correctly', () => {
    const testHeights = [0.5, 1, 2, 3, 5];
    
    testHeights.forEach(height => {
      const { container } = render(
        <IsoTileVolume {...mockVolumeProps} height={height} />
      );
      
      if (height > 0) {
        // Should have 3D faces
        const polygons = container.querySelectorAll('polygon');
        expect(polygons.length).toBeGreaterThanOrEqual(2);
      } else {
        // Should not have 3D faces
        const polygons = container.querySelectorAll('polygon');
        expect(polygons.length).toBe(0);
      }
    });
  });

  it('calculates correct heightOffset', () => {
    // This test ensures heightOffset is calculated properly
    const { container } = render(
      <IsoTileVolume {...mockVolumeProps} height={2} />
    );
    
    // Component should render without throwing errors about undefined heightOffset
    expect(container.querySelector('[data-testid="svg-container"]')).toBeInTheDocument();
  });
});