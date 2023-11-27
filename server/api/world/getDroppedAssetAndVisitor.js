import { Visitor, DroppedAsset } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const getDroppedAssetAndVisitor = async (req, res) => {
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
    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });
    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
      visitor.fetchVisitor(),
      visitor.fetchDataObject(),
    ]);

    return res.json({ droppedAsset, visitor, success: true });
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
