// Server-side source of truth for theme rules. Keep in sync with client/src/constants.ts
// (categories with selectionLimits.min > 0, split by topLayerOrder / bottomLayerOrder).
export const THEMES: {
  [themeName: string]: {
    shouldDropAsset: boolean;
    requiredTopLayerCategories: string[];
    requiredBottomLayerCategories: string[];
  };
} = {
  locker: {
    shouldDropAsset: false,
    requiredTopLayerCategories: ["Locker Base"],
    requiredBottomLayerCategories: [],
  },
  desk: {
    shouldDropAsset: false,
    requiredTopLayerCategories: ["Desk"],
    requiredBottomLayerCategories: ["Wall", "Floor"],
  },
  snowman: {
    shouldDropAsset: true,
    requiredTopLayerCategories: ["Body"],
    requiredBottomLayerCategories: [],
  },
  pumpkin: {
    shouldDropAsset: true,
    requiredTopLayerCategories: ["Body"],
    requiredBottomLayerCategories: [],
  },
};
