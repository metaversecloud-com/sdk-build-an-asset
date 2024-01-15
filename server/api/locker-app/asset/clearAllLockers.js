import { Visitor, World, DroppedAsset } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

export const clearAllLockers = async (req, res) => {
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

    const allAssetAssets = await getAllLockerAssets(urlSlug, visitor, world);

    await clearAllLockersRequest(urlSlug, allAssetAssets, credentials);

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

async function clearAllLockersRequest(urlSlug, spawnedAssets, credentials) {
  await Promise.all(
    spawnedAssets.map((spawnedAsset) => {
      spawnedAsset.setDataObject({ locker: null });
      spawnedAsset.setInteractiveSettings({
        isInteractive: true,
        interactivePublicKey: "qz37yqVSpMLyeYtz2o1a",
      });
    })
  );
}

async function getAllLockerAssets(urlSlug, visitor, world) {
  await world.fetchDroppedAssets();
  const allAssets = world.droppedAssets;

  const keys = Object.entries(allAssets);
  let arr = keys.map((test) => {
    return test[1];
  });
  arr = Array.from(arr);

  let spawnedAsset = arr?.filter(
    (item) => item.uniqueName && item.uniqueName?.includes(`lockerSystem-`)
  );

  const promises = spawnedAsset.map((asset) => {
    return asset.fetchDataObject();
  });

  const results = await Promise.all(promises);

  return results;
}
