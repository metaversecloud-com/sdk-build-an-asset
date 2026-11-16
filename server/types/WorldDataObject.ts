export type ThemeSettings = {
  // null = unlimited (default)
  maxDroppedAssets?: number | null;
};

export type WorldDataObject = {
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
