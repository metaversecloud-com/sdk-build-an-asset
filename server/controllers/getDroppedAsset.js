import { DroppedAsset } from "../utils/topiaInit.js";
export const getDroppedAsset = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
      themeName,
    } = req.query;

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });
    return res.json({ droppedAsset, success: true });
  } catch (error) {
    console.error("❌ Error getting the droppedAsset", JSON.stringify(error));
    return res.status(500).send({ error, success: false });
  }
};
