import { errorHandler, getBaseUrl } from "./index.js";
import { getS3URL } from "./images/getS3URL.js";
import { DroppedAsset } from "@rtsdk/topia";

export const clearAllDroppedAssets = async ({
  droppedAssets,
  hostname,
  themeName,
}: {
  droppedAssets: DroppedAsset[];
  hostname: string;
  themeName: string;
}) => {
  try {
    const baseUrl = getBaseUrl(hostname);

    const promises: any[] = [];
    droppedAssets.map((asset) => {
      promises.push(asset.updateWebImageLayers("", `${getS3URL(themeName)}/unclaimedAsset.png`));
      promises.push(asset.updateClickType({ clickableLink: `${baseUrl}/${themeName}`, clickableLinkTitle: themeName }));
    });

    await Promise.all(promises);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "clearAllDroppedAssets",
      message: "Error clearing all dropped assets",
    });
  }
};
