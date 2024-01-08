import { Visitor, DroppedAsset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

export const getLockerDroppedAssetAndVisitor = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    const world = await World.create(urlSlug, { credentials });

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });
    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
      visitor.fetchVisitor(),
      visitor.fetchDataObject(),
    ]);

    let isAssetSpawnedInWorld = false;

    let spawnedAsset = null;
    const spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `lockerSystem-${visitor?.profileId}`,
    });

    if (spawnedAssets && spawnedAssets.length) {
      isAssetSpawnedInWorld = true;
      spawnedAsset = spawnedAssets?.[0];
    }

    // await visitor.setDataObject({ asset: null });

    return res.json({
      droppedAsset,
      visitor,
      isAssetSpawnedInWorld,
      spawnedAsset,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🐹 Error getting droppedAsset and Visitor",
      functionName: "getDroppedAssetAndVisitor",
      req,
    });
    return res.status(500).send({ error, success: false });
  }
};
