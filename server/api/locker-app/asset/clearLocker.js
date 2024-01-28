import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";
import { getBaseUrl } from "../../utils.js";

let BASE_URL;
let DEFAULT_URL_FOR_IMAGE_HOSTING = null;

export const clearLocker = async (req, res) => {
  try {
    const protocol = process.env.INSTANCE_PROTOCOL;
    const host = req.host;
    const port = req.port;

    if (host === "localhost") {
      BASE_URL = `http://localhost:3001`;
      DEFAULT_URL_FOR_IMAGE_HOSTING =
        "https://locker0-dev-topia.topia-rtsdk.com";
    } else {
      BASE_URL = `${protocol}://${host}`;
      DEFAULT_URL_FOR_IMAGE_HOSTING = BASE_URL;
    }

    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
      uniqueName,
      profileId,
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

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
      visitor.fetchVisitor(),
      visitor.fetchDataObject(),
    ]);

    const toplayer = `${DEFAULT_URL_FOR_IMAGE_HOSTING}/assets/locker/output/unclaimedLocker.png`;
    await droppedAsset?.updateWebImageLayers("", toplayer);

    const clickableLink = `${BASE_URL}/locker`;

    await droppedAsset?.updateClickType({
      clickType: "link",
      clickableLink,
      clickableLinkTitle: "Locker",
      clickableDisplayTextDescription: "Locker",
      clickableDisplayTextHeadline: "Locker",
      isOpenLinkInDrawer: true,
    });

    await world.updateDataObject({
      lockers: {
        ...world.dataObject.lockers,
        [profileId]: null,
      },
    });

    return res.json({
      spawnSuccess: true,
      success: true,
      isAssetSpawnedInWorld: true,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while spawning the asset",
      functionName: "spawn",
      req,
    });
    return res
      .status(500)
      .send({ error: error?.message, spawnSuccess: false, success: false });
  }
};
