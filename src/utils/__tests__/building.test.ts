import { getBuilding } from '../building';

describe('getBuilding', () => {
  // 3 tiles along x, 2 along y, 2 floors
  const base = {
    from: { x: 0, y: 0 },
    to: { x: 2, y: 1 },
    height: 2,
    roof: 'GABLE' as const,
    roofHeight: 1,
    windows: true,
    door: true,
    doorFacade: 'RIGHT' as const
  };

  const count = (faces: { kind: string }[], kind: string) => {
    return faces.filter((face) => {
      return face.kind === kind;
    }).length;
  };

  it('draws a flat roof as a single top face over the two facades', () => {
    const { faces } = getBuilding({ ...base, roof: 'FLAT' });

    expect(count(faces, 'WALL')).toBe(2);
    expect(count(faces, 'ROOF')).toBe(1);
  });

  it('draws a gable roof with a slope and a vertical gable end', () => {
    const { faces } = getBuilding(base);

    // The two facades plus the gable end facing the viewer
    expect(count(faces, 'WALL')).toBe(3);
    expect(count(faces, 'ROOF')).toBeGreaterThanOrEqual(1);
  });

  it('draws a hip roof with sloped ends instead of gables', () => {
    const { faces } = getBuilding({ ...base, roof: 'HIP' });

    expect(count(faces, 'WALL')).toBe(2);
    expect(count(faces, 'ROOF')).toBeGreaterThanOrEqual(2);
  });

  it('puts a window per tile and floor on both facades, and the door on the ground floor', () => {
    const { openings } = getBuilding(base);

    // (2 + 3 tiles) x 2 floors, one of them taken by the door
    expect(count(openings, 'WINDOW')).toBe(9);
    expect(count(openings, 'DOOR')).toBe(1);
  });

  it('can leave out the windows and the door', () => {
    expect(getBuilding({ ...base, windows: false }).openings).toHaveLength(1);
    expect(
      getBuilding({ ...base, windows: false, door: false }).openings
    ).toHaveLength(0);
  });
});
