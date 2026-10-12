import { modelSchema } from 'src/schemas';
import { initialData } from '../initialData';

describe('opening scene', () => {
  // Surfaces and connectors are the background of the scene: they aren't moved by mistake
  it('loads with its rectangles and connectors locked', () => {
    const result = modelSchema.safeParse(initialData);

    expect(result.success).toBe(true);
    if (!result.success) return;

    result.data.views.forEach((view) => {
      [...(view.rectangles ?? []), ...(view.connectors ?? [])].forEach(
        (item) => {
          expect(item).toHaveProperty('locked', true);
        }
      );
    });
  });
});
