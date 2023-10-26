import { DroppedAsset, Visitor, User, World } from "../topiaInit.js";
import { isAssetInWorld } from "./utils.js";
import { logger } from "../../logs/logger.js";

export const get = async (req, res) => {
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
      // not owner view
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

    if (!visitor.dataObject.asset) {
      return res.json({
        asset: null,
        visitor,
        isAssetAssetOwner: false,
        success: true,
      });
    }

    visitor.dataObject.asset.isAssetInWorld = await isAssetInWorld(
      urlSlug,
      visitor,
      credentials
    );

    return res.json({
      asset: visitor?.dataObject?.asset,
      visitor,
      isAssetAssetOwner,
      success: true,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while getting the asset",
      functionName: "get",
      req,
    });
    return res
      .status(500)
      .send({ requestId: req.id, error: error?.message, success: false });
  }
};
