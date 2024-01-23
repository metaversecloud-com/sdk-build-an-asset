import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";
import { getBaseUrl } from "../../utils.js";

let BASE_URL;

export const clearLocker = async (req, res) => {
  try {
    const protocol = process.env.INSTANCE_PROTOCOL;
    const host = req.host;
    const port = req.port;
    const DEFAULT_URL_FOR_IMAGE_HOSTING =
      "https://snowman0-dev-topia.topia-rtsdk.com";

    if (host === "localhost") {
      BASE_URL = `http://localhost:3001`;
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

    await droppedAsset?.setDataObject(null);
    await droppedAsset?.setDataObject({});

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
