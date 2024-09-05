import { Request, Response } from "express";
import { Visitor, DroppedAsset, World, getCredentials, errorHandler } from "../utils/index.js";

export const handleGetGameState = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, themeName, urlSlug, visitorId } = credentials;

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    const world = await World.create(urlSlug, { credentials });
    const keyAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    await Promise.all([
      keyAsset.fetchDroppedAssetById(),
      keyAsset.fetchDataObject(),
      visitor.fetchVisitor(),
      visitor.fetchDataObject(),
    ]);

    let isAssetDroppedInWorld = false,
      droppedAsset = null;

    const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `${themeName}System-${visitor?.profileId}`,
    });

    if (droppedAssets && droppedAssets.length) {
      isAssetDroppedInWorld = true;
      droppedAsset = droppedAssets?.[0];
    }

    return res.json({
      keyAsset,
      visitor,
      isAssetDroppedInWorld,
      droppedAsset,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleGetGameState",
      message: "Error getting game state",
      req,
      res,
    });
  }
};
