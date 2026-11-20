import { Request, Response } from "express";
import {
  assertCanManageDroppedAsset,
  errorHandler,
  getKeyAssetDataObject,
  getDroppedAssetOwnerProfileId,
  getRequiredCredentials,
  releaseClaimedAsset,
} from "../utils/index.js";

export const handleClearDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getRequiredCredentials(req.query);
    const { assetId, profileId, themeName } = credentials;

    const { isClearAssetFromUnclaimedAsset } = req.body;

    const { dataObjectEntity, dataObject } = await getKeyAssetDataObject(credentials);

    // ownerProfileId is looked up from the data object; the query param is ignored
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
      dataObjectEntity.updateDataObject(
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

    await dataObjectEntity.fetchDataObject();

    return res.json({ worldDataObject: dataObjectEntity.dataObject });
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
