import { Request, Response } from "express";
import { DroppedAsset, World, errorHandler, getBaseUrl, getCredentials } from "../utils/index.js";
import { WorldDataObject } from "../types/WorldDataObject.js";
import { getS3URL } from "../utils/images/getS3URL.js";

export const handleClearDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug } = credentials;

    let { ownerProfileId } = req.query;
    let selectedAssetId = assetId;

    const { isClearAssetFromUnclaimedAsset } = req.body;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    if (isClearAssetFromUnclaimedAsset) {
      selectedAssetId = dataObject?.[themeName]?.[profileId]?.droppedAssetId;
      ownerProfileId = profileId;
    } else {
      selectedAssetId = assetId;
    }

    const baseUrl = getBaseUrl(req.hostname);

    const droppedAsset = DroppedAsset.create(selectedAssetId, urlSlug, { credentials });

    await Promise.all([
      droppedAsset?.updateWebImageLayers("", `${getS3URL(themeName)}/unclaimedAsset.png`),
      droppedAsset?.updateClickType({ clickableLink: `${baseUrl}/${themeName}`, clickableLinkTitle: themeName }),
      world.updateDataObject(
        {
          [`${themeName}.${ownerProfileId}`]: null,
        },
        {
          analytics: [
            {
              analyticName: `${themeName}-unclaims`,
              profileId,
              uniqueKey: profileId,
            },
          ],
        },
      ),
    ]);

    await world.fetchDataObject();

    return res.json({ worldDataObject: world.dataObject });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleClearDroppedAsset",
      message: "Error clearing dropped asset",
      req,
      res,
    });
  }
};
