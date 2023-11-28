import { DroppedAsset, Visitor, User, World } from "../topiaInit.js";
import { isAssetInWorld } from "./utils.js";
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
    const assetSpawnedDroppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });
    await Promise.all([
      assetSpawnedDroppedAsset.fetchDroppedAssetById(),
      assetSpawnedDroppedAsset.fetchDataObject(),
      visitor.fetchVisitor(),
      visitor.fetchDataObject(),
    ]);

    let isAssetAssetOwner = false;
    if (
      !assetSpawnedDroppedAsset?.dataObject?.profileId ||
      assetSpawnedDroppedAsset?.dataObject?.profileId === visitor?.profileId
    ) {
      isAssetAssetOwner = true;
    } else {
      const user = User.create({
        profileId: assetSpawnedDroppedAsset?.dataObject?.profileId,
      });
      await user.fetchDataObject();

      return res.json({
        asset: user?.dataObject?.asset,
        visitor,
        isAssetAssetOwner: false,
        success: true,
      });
    }

    if (isAssetAssetOwner) {
      const { x, y } = assetSpawnedDroppedAsset?.position;
      await visitor.moveVisitor({
        shouldTeleportVisitor: false,
        x,
        y,
      });
    }

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
