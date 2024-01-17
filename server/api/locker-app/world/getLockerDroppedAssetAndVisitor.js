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
    let spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `lockerSystem-0`,
    });

    await Promise.all(
      spawnedAssets.map((asset) => {
        return asset.fetchDataObject();
      })
    );

    const userHasLocker = spawnedAssets.find((asset) => {
      if (asset?.dataObject?.profileId == visitor?.profileId) {
        return true;
      }
      return false;
    });

    return res.json({
      droppedAsset,
      visitor,
      userHasLocker,
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
