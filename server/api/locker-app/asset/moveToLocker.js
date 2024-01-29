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
      profileId,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    const userLocker = await DroppedAsset.get(
      world?.dataObject?.lockers?.[profileId]?.droppedAssetId,
      urlSlug,
      {
        credentials,
      }
    );

    const { x, y } = userLocker?.position;
    await visitor.moveVisitor({
      shouldTeleportVisitor: false,
      x,
      y,
    });

    await visitor.closeIframe(assetId);

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
