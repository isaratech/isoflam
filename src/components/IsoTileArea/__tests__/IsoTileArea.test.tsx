import React from 'react';
import { render } from '@testing-library/react';
import { IsoTileArea } from '../IsoTileArea';

// Mock the useIsoProjection hook
jest.mock('src/hooks/useIsoProjection', () => {
  return {
    useIsoProjection: () => {
      return {
        css: {},
        pxSize: { width: 100, height: 100 }
      };
    }
  };
});

describe('IsoTileArea', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <IsoTileArea from={{ x: 0, y: 0 }} to={{ x: 1, y: 1 }} />
    );
    expect(container).toBeTruthy();
  });

  it('applies solid stroke style correctly', () => {
    const { container } = render(
      <IsoTileArea
        from={{ x: 0, y: 0 }}
        to={{ x: 1, y: 1 }}
        stroke={{
          width: 1,
          color: '#000000',
          style: 'SOLID'
        }}
      />
    );

    const rect = container.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute('stroke')).toBe('#000000');
    expect(rect?.getAttribute('stroke-width')).toBe('1');
    expect(rect?.getAttribute('stroke-dasharray')).toBeNull();
  });

  it('applies dotted stroke style correctly', () => {
    const { container } = render(
      <IsoTileArea
        from={{ x: 0, y: 0 }}
        to={{ x: 1, y: 1 }}
        stroke={{
          width: 1,
          color: '#000000',
          style: 'DOTTED'
        }}
      />
    );

    const rect = container.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute('stroke')).toBe('#000000');
    expect(rect?.getAttribute('stroke-width')).toBe('1');
    expect(rect?.getAttribute('stroke-dasharray')).toBe('0, 1.8');
  });

  it('applies dashed stroke style correctly', () => {
    const { container } = render(
      <IsoTileArea
        from={{ x: 0, y: 0 }}
        to={{ x: 1, y: 1 }}
        stroke={{
          width: 1,
          color: '#000000',
          style: 'DASHED'
        }}
      />
    );

    const rect = container.querySelector('rect');
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute('stroke')).toBe('#000000');
    expect(rect?.getAttribute('stroke-width')).toBe('1');
    expect(rect?.getAttribute('stroke-dasharray')).toBe('2, 2');
  });
});