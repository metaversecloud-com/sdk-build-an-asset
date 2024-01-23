import { DroppedAsset, Visitor, User, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

export const moveToLocker = async (req, res) => {
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

    let spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `lockerSystem-0`,
    });

    await Promise.all(
      spawnedAssets.map(async (asset) => {
        try {
          await asset.fetchDataObject();
        } catch (error) {
          return null;
        }
      })
    );

    spawnedAssets = spawnedAssets.filter((asset) => asset !== null);

    const userLocker = spawnedAssets.find((asset) => {
      if (asset?.dataObject?.profileId == visitor?.profileId) {
        return true;
      }
      return false;
    });

    const { x, y } = userLocker?.position;
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
