import { Request, Response } from "express";
import {
  DroppedAsset,
  Visitor,
  World,
  assertCanManageDroppedAsset,
  deleteFromS3,
  errorHandler,
  getKeyAssetDataObject,
  getDroppedAssetOwnerProfileId,
  getRequiredCredentials,
} from "../utils/index.js";
import { DroppedAssetInterface } from "@rtsdk/topia";

export const handlePickupDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getRequiredCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    const { isClearAssetFromUnclaimedAsset } = req.body;

    const { world, dataObjectEntity, dataObject } = await getKeyAssetDataObject(credentials);

    let droppedAssets: DroppedAssetInterface[] = [];
    let ownerProfileId: string | undefined;

    if (isClearAssetFromUnclaimedAsset) {
      // player picks up their own build(s)
      ownerProfileId = profileId;
      droppedAssets = await world.fetchDroppedAssetsWithUniqueName({ uniqueName: `${themeName}System-${profileId}` });
    } else {
      const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
      const { uniqueName } = droppedAsset as DroppedAssetInterface & { uniqueName?: string };
      const uniqueNamePrefix = `${themeName}System-`;
      ownerProfileId =
        getDroppedAssetOwnerProfileId({ assetId, dataObject, themeName }) ||
        (uniqueName?.startsWith(uniqueNamePrefix) ? uniqueName.slice(uniqueNamePrefix.length) : undefined);
      await assertCanManageDroppedAsset({ credentials, ownerProfileId });
      droppedAssets = [droppedAsset];
    }

    const droppedAssetIds = droppedAssets.map(({ id }) => id).filter((id): id is string => !!id);

    if (droppedAssetIds.length > 0) {
      await World.deleteDroppedAssets(urlSlug, droppedAssetIds, process.env.INTERACTIVE_SECRET!, credentials);
      for (const { topLayerURL } of droppedAssets) {
        if (topLayerURL) deleteFromS3(req.hostname, topLayerURL);
      }
    }

    // clear the owner's record if it points at an asset that was just removed
    const ownerAssetId = ownerProfileId ? dataObject?.[themeName]?.[ownerProfileId]?.droppedAssetId : undefined;
    if (ownerAssetId && (isClearAssetFromUnclaimedAsset || droppedAssetIds.includes(ownerAssetId))) {
      await dataObjectEntity.updateDataObject({ [`${themeName}.${ownerProfileId}`]: null }, {});
    }

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });

    visitor.closeIframe(assetId).catch((error: any) =>
      errorHandler({
        error,
        functionName: "handlePickupDroppedAsset",
        message: "Error closing iframe",
      }),
    );

    visitor
      .updatePublicKeyAnalytics([
        {
          analyticName: `${themeName}-pickupUserAsset`,
          uniqueKey: profileId,
          profileId,
        },
      ])
      .catch((error: any) =>
        errorHandler({
          error,
          functionName: "handlePickupDroppedAsset",
          message: "Error updating public key analytics",
        }),
      );

    await dataObjectEntity.fetchDataObject();

    return res.json({ success: true, worldDataObject: dataObjectEntity.dataObject });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handlePickupDroppedAsset",
      message: "Error picking up dropped asset",
      req,
      res,
    });
  }
};
