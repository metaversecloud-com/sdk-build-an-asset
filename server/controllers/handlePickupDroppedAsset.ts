import { Request, Response } from "express";
import { Visitor, World, errorHandler, getCredentials } from "../utils/index.js";

export const handlePickupDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    visitor.closeIframe(assetId).catch((error: any) =>
      errorHandler({
        error,
        functionName: "handlePickupDroppedAsset",
        message: "Error closing iframe",
      }),
    );

    visitor.updatePublicKeyAnalytics([
      {
        analyticName: `${themeName}-pickupUserAsset`,
        uniqueKey: profileId,
        profileId,
      },
    ]);

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
