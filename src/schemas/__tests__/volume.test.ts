import {volumeSchema} from '../volume';

describe('Volume schema validation', () => {
  it('accepts valid volume data', () => {
    const validVolume = {
      id: 'test-volume',
      color: 'color1',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 },
      height: 1,
      style: 'SOLID',
        width: 1
    };

    const result = volumeSchema.safeParse(validVolume);
    expect(result.success).toBe(true);
  });

  it('rejects volume with negative height', () => {
    const invalidVolume = {
      id: 'test-volume',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 },
      height: -1
    };

    const result = volumeSchema.safeParse(invalidVolume);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('height');
    }
  });

  it('uses default height when not provided', () => {
    const volumeWithoutHeight = {
      id: 'test-volume',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 }
    };

    const result = volumeSchema.safeParse(volumeWithoutHeight);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.height).toBe(1);
    }
  });

  it('accepts valid style options', () => {
    const styles = ['NONE', 'SOLID', 'DASHED'] as const;
    
    styles.forEach(style => {
      const volume = {
        id: 'test-volume',
        from: { x: 0, y: 0 },
        to: { x: 2, y: 2 },
        height: 1,
        style
      };

      const result = volumeSchema.safeParse(volume);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid style options', () => {
    const volume = {
      id: 'test-volume',
      from: { x: 0, y: 0 },
      to: { x: 2, y: 2 },
      height: 1,
      style: 'INVALID_STYLE'
    };

    const result = volumeSchema.safeParse(volume);
    expect(result.success).toBe(false);
  });
});