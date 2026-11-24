import { AppDataObject } from "../types/index.js";

export const isDroppedAssetClaimed = ({
  assetId,
  dataObject,
  profileId,
  themeName,
}: {
  assetId: string;
  dataObject: AppDataObject;
  profileId: string;
  themeName: string;
}) => {
  if (dataObject?.[themeName]) {
    const claimedAssets = Object.entries(dataObject[themeName]).reduce((claimedAssets, [ownerProfileId, asset]) => {
      if (asset && asset.droppedAssetId === assetId && ownerProfileId !== profileId) {
        return asset;
      }
      return claimedAssets;
    }, {});

    if (Object.keys(claimedAssets).length) {
      return true;
    }
  }
  return false;
};
