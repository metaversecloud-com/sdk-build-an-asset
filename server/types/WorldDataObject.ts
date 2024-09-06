export type WorldDataObject = {
  [themeName: string]: {
    [profileId: string]: {
      droppedAssetId: string;
      s3Url: string;
    };
  };
};
