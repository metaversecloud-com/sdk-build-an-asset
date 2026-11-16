import { Request, Response } from "express";
import {
  World,
  assertCanManageDroppedAsset,
  errorHandler,
  getDroppedAssetOwnerProfileId,
  getRequiredCredentials,
  releaseClaimedAsset,
} from "../utils/index.js";
import { WorldDataObject } from "../types/WorldDataObject.js";

export const handleClearDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getRequiredCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug } = credentials;

    const { isClearAssetFromUnclaimedAsset } = req.body;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    // ownerProfileId is looked up from the world data object; the query param is ignored
    let selectedAssetId: string | undefined;
    let ownerProfileId: string | undefined;

    if (isClearAssetFromUnclaimedAsset) {
      selectedAssetId = dataObject?.[themeName]?.[profileId]?.droppedAssetId;
      ownerProfileId = profileId;
      if (!selectedAssetId) throw { status: 404, message: `You don't have a ${themeName} to clear` };
    } else {
      selectedAssetId = assetId;
      ownerProfileId = getDroppedAssetOwnerProfileId({ assetId, dataObject, themeName });
      await assertCanManageDroppedAsset({ credentials, ownerProfileId });
    }

    await Promise.all([
      releaseClaimedAsset({ credentials, droppedAssetId: selectedAssetId, hostname: req.hostname }),
      world.updateDataObject(
        ownerProfileId && dataObject?.[themeName] ? { [`${themeName}.${ownerProfileId}`]: null } : {},
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
