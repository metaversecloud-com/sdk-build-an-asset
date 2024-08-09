import { DroppedAsset, Visitor, World } from "../utils/topiaInit.js";
import { logger } from "../logs/logger.js";

export const moveToAsset = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
      profileId,
      themeName,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const { closeIframeAfterMove } = req.body;

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    const userAsset = await DroppedAsset.get(
      world?.dataObject?.[themeName]?.[profileId]?.droppedAssetId,
      urlSlug,
      {
        credentials,
      }
    );

    const { x, y } = userAsset?.position;
    await visitor.moveVisitor({
      shouldTeleportVisitor: false,
      x,
      y,
    });

    if (closeIframeAfterMove) {
      await visitor.closeIframe(assetId);
    }

    return res.json({
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
