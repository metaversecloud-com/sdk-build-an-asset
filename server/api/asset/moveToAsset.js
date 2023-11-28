import { DroppedAsset, Visitor, User, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const moveToAsset = async (req, res) => {
  try {
    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    const world = await World.create(urlSlug, { credentials });
    await Promise.all([visitor.fetchVisitor(), visitor.fetchDataObject()]);

    const spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `assetSystem-${visitor?.profileId}`,
    });

    let spawnedAsset;

    if (!spawnedAssets && !spawnedAssets?.length) {
      return res.status(404).json({ msg: "Asset not found" });
    }

    spawnedAsset = spawnedAssets?.[0];

    const { x, y } = spawnedAsset?.position;
    await visitor.moveVisitor({
      shouldTeleportVisitor: false,
      x,
      y,
    });

    return res.json({
      asset: visitor?.dataObject?.asset,
      visitor,
      isAssetAssetOwner,
      success: true,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while moving towards the asset",
      functionName: "get",
      req,
    });
    return res
      .status(500)
      .send({ requestId: req.id, error: error?.message, success: false });
  }
};
