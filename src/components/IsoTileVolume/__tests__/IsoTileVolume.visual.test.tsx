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
  getBoundingBox: jest.fn((coords: Coords[]) => [
    { x: Math.min(...coords.map((c: Coords) => c.x)), y: Math.min(...coords.map((c: Coords) => c.y)) },
    { x: Math.max(...coords.map((c: Coords) => c.x)), y: Math.min(...coords.map((c: Coords) => c.y)) },
    { x: Math.max(...coords.map((c: Coords) => c.x)), y: Math.max(...coords.map((c: Coords) => c.y)) },
    { x: Math.min(...coords.map((c: Coords) => c.x)), y: Math.max(...coords.map((c: Coords) => c.y)) }
  ]),
  getTilePosition: jest.fn(({ tile }: { tile: Coords }) => ({
    x: tile.x * 100,
    y: tile.y * 100
  }))
}));

// Mock the SVG component to render actual SVG for screenshots
jest.mock('src/components/Svg/Svg', () => ({
  Svg: ({ children, viewboxSize, style }: any) => (
    <div 
      data-testid="svg-container"
      style={{ 
        ...style,
        position: 'relative',
        border: '1px solid #ccc',
        backgroundColor: '#f9f9f9'
      }}
    >
      <svg 
        width={viewboxSize.width} 
        height={viewboxSize.height}
        viewBox={`0 0 ${viewboxSize.width} ${viewboxSize.height}`}
        style={{ display: 'block' }}
      >
        {children}
      </svg>
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

describe('IsoTileVolume Visual Tests', () => {
  const createVolumeTestCase = (name: string, props: Partial<React.ComponentProps<typeof IsoTileVolume>>) => {
    it(`renders ${name}`, () => {
      const defaultProps = {
        from: { x: 0, y: 0 },
        to: { x: 2, y: 2 },
        height: 1,
        fill: '#4A90E2',
        isometric: true
      };

      const { container } = render(
        <div style={{ padding: '50px', backgroundColor: '#fff' }}>
          <h3>{name}</h3>
          <IsoTileVolume {...defaultProps} {...props} />
        </div>
      );

      expect(container).toMatchSnapshot(`volume-${name.replace(/\s+/g, '-').toLowerCase()}`);
    });
  };

  // Test different heights
  createVolumeTestCase('height-0.5', { height: 0.5 });
  createVolumeTestCase('height-1', { height: 1 });
  createVolumeTestCase('height-2', { height: 2 });
  createVolumeTestCase('height-3', { height: 3 });
  createVolumeTestCase('height-5', { height: 5 });

  // Test different sizes
  createVolumeTestCase('small-1x1', { 
    from: { x: 0, y: 0 }, 
    to: { x: 0, y: 0 }, 
    height: 2 
  });
  
  createVolumeTestCase('medium-2x2', { 
    from: { x: 0, y: 0 }, 
    to: { x: 1, y: 1 }, 
    height: 2 
  });
  
  createVolumeTestCase('large-4x3', { 
    from: { x: 0, y: 0 }, 
    to: { x: 3, y: 2 }, 
    height: 2 
  });

  // Test different colors
  createVolumeTestCase('red-volume', { 
    fill: '#E74C3C', 
    height: 2 
  });
  
  createVolumeTestCase('green-volume', { 
    fill: '#2ECC71', 
    height: 2 
  });
  
  createVolumeTestCase('blue-volume', { 
    fill: '#3498DB', 
    height: 2 
  });

  // Test with strokes
  createVolumeTestCase('with-solid-stroke', {
    height: 2,
    stroke: {
      width: 2,
      color: '#2C3E50',
      style: 'SOLID' as const
    }
  });

  createVolumeTestCase('with-dashed-stroke', {
    height: 2,
    stroke: {
      width: 2,
      color: '#E67E22',
      style: 'DASHED' as const
    }
  });

  createVolumeTestCase('with-dotted-stroke', {
    height: 2,
    stroke: {
      width: 2,
      color: '#9B59B6',
      style: 'DOTTED' as const
    }
  });

  // Test non-isometric mode
  createVolumeTestCase('non-isometric', {
    height: 2,
    isometric: false,
    fill: '#F39C12'
  });

  // Test edge cases
  createVolumeTestCase('zero-height', { height: 0 });
  
  createVolumeTestCase('negative-coordinates', {
    from: { x: -1, y: -1 },
    to: { x: 1, y: 1 },
    height: 2
  });

  // Test combinations
  createVolumeTestCase('tall-thin-volume', {
    from: { x: 0, y: 0 },
    to: { x: 0, y: 3 },
    height: 4,
    fill: '#1ABC9C'
  });

  createVolumeTestCase('wide-flat-volume', {
    from: { x: 0, y: 0 },
    to: { x: 4, y: 0 },
    height: 1,
    fill: '#F1C40F'
  });

  // Test with corner radius (if supported)
  createVolumeTestCase('with-corner-radius', {
    height: 2,
    cornerRadius: 10,
    fill: '#E91E63'
  });

  // Multiple volume comparison test
  it('renders multiple volumes comparison', () => {
    const { container } = render(
      <div style={{ 
        padding: '50px', 
        backgroundColor: '#fff',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <h2>Volume Tool Visual Comparison</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <h4>Height 1</h4>
            <IsoTileVolume 
              from={{ x: 0, y: 0 }} 
              to={{ x: 1, y: 1 }} 
              height={1} 
              fill="#E74C3C" 
            />
          </div>
          <div>
            <h4>Height 2</h4>
            <IsoTileVolume 
              from={{ x: 0, y: 0 }} 
              to={{ x: 1, y: 1 }} 
              height={2} 
              fill="#3498DB" 
            />
          </div>
          <div>
            <h4>Height 3</h4>
            <IsoTileVolume 
              from={{ x: 0, y: 0 }} 
              to={{ x: 1, y: 1 }} 
              height={3} 
              fill="#2ECC71" 
            />
          </div>
          <div>
            <h4>Height 4</h4>
            <IsoTileVolume 
              from={{ x: 0, y: 0 }} 
              to={{ x: 1, y: 1 }} 
              height={4} 
              fill="#F39C12" 
            />
          </div>
        </div>
      </div>
    );

    expect(container).toMatchSnapshot('multiple-volumes-comparison');
  });
});