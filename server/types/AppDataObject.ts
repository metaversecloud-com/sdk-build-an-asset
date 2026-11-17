export type ThemeSettings = {
  // null = unlimited (default)
  maxDroppedAssets?: number | null;
};

// Stored on the theme's key asset (uniqueName `BuildAnAsset_keyAsset_{themeName}`), or on the
// world when the world has no key asset for the theme. See server/utils/getKeyAssetDataObject.ts.
export type AppDataObject = {
  settings?: {
    [themeName: string]: ThemeSettings;
  };
} & {
  [themeName: string]: {
    [profileId: string]: {
      droppedAssetId: string;
      s3Url: string;
      droppedAt?: number;
    };
  };
};
