import { Visitor, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

export const pickup = async (req, res) => {
  try {
    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
      isSpawnedDroppedAsset,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials,
    });

    await visitor.fetchDataObject();

    if (isSpawnedDroppedAsset) {
      await visitor.closeIframe(assetId);
    }

    await removeAllUserAssets(urlSlug, visitor, credentials);

    return res.json({ success: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🐹 Error while picking up the asset",
      functionName: "pickup",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};

async function removeAllUserAssets(urlSlug, visitor, credentials) {
  const world = await World.create(urlSlug, { credentials });

  try {
    const spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `assetSystem-${visitor?.profileId}`,
    });

    if (spawnedAssets && spawnedAssets.length) {
      await Promise.all(
        spawnedAssets.map((spawnedAsset) => spawnedAsset.deleteDroppedAsset())
      );
    }
  } catch (error) {
    console.error(
      "❌ There are no assets to be deleted.",
      JSON.stringify(error)
    );
  }
}
