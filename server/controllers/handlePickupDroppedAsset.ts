import { Request, Response } from "express";
import { DroppedAsset, Visitor, World, errorHandler, getCredentials } from "../utils/index.js";

export const handlePickupDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    const { isClearAssetFromUnclaimedAsset } = req.body;

    const visitor = await Visitor.create(visitorId, urlSlug, { credentials });

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

    if (isClearAssetFromUnclaimedAsset) {
      const world = await World.create(urlSlug, { credentials });

      const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
        uniqueName: `${themeName}System-${visitor?.profileId}`,
      });

      if (Object.keys(droppedAssets).length > 0) {
        const droppedAssetIds: string[] = [];
        for (const index in droppedAssets) {
          if (droppedAssets[index].id) droppedAssetIds.push(droppedAssets[index].id);
        }
        await World.deleteDroppedAssets(
          credentials.urlSlug,
          droppedAssetIds,
          process.env.INTERACTIVE_SECRET!,
          credentials,
        );
      }
    } else {
      const droppedAsset = DroppedAsset.create(assetId, urlSlug, { credentials });
      await droppedAsset.deleteDroppedAsset();
    }

    return res.json({ success: true });
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
