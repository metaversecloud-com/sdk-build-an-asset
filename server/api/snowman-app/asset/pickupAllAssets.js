import { Visitor, World, DroppedAsset } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

export const pickupAllAssets = async (req, res) => {
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

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials,
    });

    if (!visitor?.isAdmin) {
      return res.status(401).json({
        msg: "Only admins have enough permissions to pick up all assets",
      });
    }

    const world = await World.create(urlSlug, { credentials });

    const allAssetAssets = await getAllAssetAssets(urlSlug, visitor, world);

    await deleteAllAssets(urlSlug, allAssetAssets, credentials);

    world
      .updateDataObject(
        {},
        {
          analytics: [`snowman-pickupAllAssets`],
          uniqueKey: visitor?.profileId,
          profileId,
        }
      )
      .then()
      .catch(console.error("Error when sending pickupAllAssets to analytics"));

    return res.json({ success: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🧹 Error while deleting all the assets",
      functionName: "deleteAll",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};

async function deleteAllAssets(urlSlug, assetAssets, credentials) {
  await Promise.all(
    assetAssets.map((assetAsset) =>
      deleteAssetRequest(urlSlug, assetAsset, credentials)
    )
  );
}

async function deleteAssetRequest(urlSlug, assetAsset, credentials) {
  const droppedAsset = await DroppedAsset.get(assetAsset?.id, urlSlug, {
    credentials,
  });

  await droppedAsset.deleteDroppedAsset();
}

async function getAllAssetAssets(urlSlug, visitor, world) {
  await world.fetchDroppedAssets();
  const allAssets = world.droppedAssets;

  const keys = Object.entries(allAssets);
  let arr = keys.map((test) => {
    return test[1];
  });
  arr = Array.from(arr);

  const assetAsset = arr?.filter(
    (item) => item.uniqueName && item.uniqueName?.includes(`assetSystem-`)
  );

  return assetAsset;
}
