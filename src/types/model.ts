import z from 'zod';
import {
    anchorSchema,
    colorsSchema,
    connectorSchema,
    connectorStyleOptions,
    iconSchema,
    iconsSchema,
    modelItemSchema,
    modelItemsSchema,
    rectangleSchema,
    rectangleStyleOptions,
    roadAnchorSchema,
    roadSchema,
    roadStyleOptions,
    textBoxSchema,
    viewItemSchema,
    viewSchema,
    viewsSchema
} from 'src/schemas';
import {StoreApi} from 'zustand';

export { connectorStyleOptions, rectangleStyleOptions, roadStyleOptions } from 'src/schemas';
export type Model = {
    version?: string;
    title: string;
    description?: string;
    items: ModelItems;
    views: Views;
    icons?: Icons;
    colors?: Colors;
};
export type ModelItems = z.infer<typeof modelItemsSchema>;
export type Icon = z.infer<typeof iconSchema>;
export type Icons = z.infer<typeof iconsSchema>;
export type Colors = z.infer<typeof colorsSchema>;
export type ModelItem = z.infer<typeof modelItemSchema>;
export type Views = z.infer<typeof viewsSchema>;
export type View = z.infer<typeof viewSchema>;
export type ViewItem = z.infer<typeof viewItemSchema>;
export type ConnectorStyle = keyof typeof connectorStyleOptions;
export type RectangleStyle = keyof typeof rectangleStyleOptions;
export type RoadStyle = keyof typeof roadStyleOptions;
export type ConnectorAnchor = z.infer<typeof anchorSchema>;
export type Connector = z.infer<typeof connectorSchema>;
export type TextBox = z.infer<typeof textBoxSchema>;
export type Rectangle = z.infer<typeof rectangleSchema>;
export type RoadAnchor = z.infer<typeof roadAnchorSchema>;
export type Road = z.infer<typeof roadSchema>;

export type ModelStore = Model & {
  actions: {
    get: StoreApi<ModelStore>['getState'];
    set: StoreApi<ModelStore>['setState'];
  };
};
