import React from 'react';
import {render} from '@testing-library/react';
import {Volume} from '../Volume';

// Mock the config file to avoid icon loading issues in tests
jest.mock('src/config', () => ({
  DEFAULT_COLOR: { id: '__DEFAULT__', value: '#000000' }
}));

// Mock the hooks and components
jest.mock('src/hooks/useColor', () => ({
  useColor: jest.fn(() => ({ value: '#ffffff' }))
}));

jest.mock('src/components/IsoTileVolume/IsoTileVolume', () => ({
  IsoTileVolume: ({ children, ...props }: any) => {
    // Extract and convert relevant props for testing
    const testProps: Record<string, any> = {};
    if (props.from) testProps['data-from'] = JSON.stringify(props.from);
    if (props.to) testProps['data-to'] = JSON.stringify(props.to);
    if (props.height !== undefined) testProps['data-height'] = props.height.toString();
    if (props.imageData) testProps['data-image-data'] = 'true';
    if (props.mirrorHorizontal !== undefined) testProps['data-mirror-horizontal'] = props.mirrorHorizontal.toString();
    if (props.mirrorVertical !== undefined) testProps['data-mirror-vertical'] = props.mirrorVertical.toString();
    if (props.rotationAngle !== undefined) testProps['data-rotation-angle'] = props.rotationAngle.toString();
    if (props.stroke) testProps['data-stroke'] = 'true';
    
    return (
      <div data-testid="iso-tile-volume" {...testProps}>
        {children}
      </div>
    );
  }
}));

jest.mock('src/utils', () => ({
  getColorVariant: jest.fn(() => '#000000')
}));

const mockVolumeProps = {
  id: 'test-volume-1',
  from: { x: 0, y: 0 },
  to: { x: 2, y: 2 },
  height: 1,
  color: '__DEFAULT__',
  style: 'SOLID' as const,
  width: 1,
  imageData: undefined,
  mirrorHorizontal: false,
  mirrorVertical: false,
  rotationAngle: 0,
  isometric: true
};

describe('Volume', () => {
  it('renders without crashing', () => {
    render(<Volume {...mockVolumeProps} />);
  });

  it('passes correct props to IsoTileVolume', () => {
    const { getByTestId } = render(<Volume {...mockVolumeProps} />);
    
    const isoTileVolume = getByTestId('iso-tile-volume');
    
    expect(isoTileVolume).toHaveAttribute('data-from');
    expect(isoTileVolume).toHaveAttribute('data-to');
    expect(isoTileVolume).toHaveAttribute('data-height', '1');
  });

  it('applies stroke when style is not NONE', () => {
    const propsWithStroke = {
      ...mockVolumeProps,
      style: 'SOLID' as const
    };
    
    const { getByTestId } = render(<Volume {...propsWithStroke} />);
    const isoTileVolume = getByTestId('iso-tile-volume');
    
    // Should have stroke props
    expect(isoTileVolume).toHaveAttribute('data-stroke', 'true');
  });

  it('does not apply stroke when style is NONE', () => {
    const propsWithoutStroke = {
      ...mockVolumeProps,
      style: 'NONE' as const
    };
    
    const { getByTestId } = render(<Volume {...propsWithoutStroke} />);
    const isoTileVolume = getByTestId('iso-tile-volume');
    
    // Should not have stroke
    expect(isoTileVolume).not.toHaveAttribute('data-stroke');
  });

  it('handles image data props correctly', () => {
    const propsWithImage = {
      ...mockVolumeProps,
      imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      mirrorHorizontal: true,
      mirrorVertical: false,
      rotationAngle: 90
    };
    
    const { getByTestId } = render(<Volume {...propsWithImage} />);
    const isoTileVolume = getByTestId('iso-tile-volume');
    
    expect(isoTileVolume).toHaveAttribute('data-image-data', 'true');
    expect(isoTileVolume).toHaveAttribute('data-mirror-horizontal', 'true');
    expect(isoTileVolume).toHaveAttribute('data-mirror-vertical', 'false');
    expect(isoTileVolume).toHaveAttribute('data-rotation-angle', '90');
  });
});