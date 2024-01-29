import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";
import { getBaseUrl } from "./requestHandlers.js";

export const clearLocker = async (req, res) => {
  try {
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

    const { baseUrl, defaultUrlForImageHosting } = getBaseUrl(req);

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

    const toplayer = `${defaultUrlForImageHosting}/assets/locker/output/unclaimedLocker.png`;
    await droppedAsset?.updateWebImageLayers("", toplayer);

    const clickableLink = `${baseUrl}/locker`;

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
      message: "❌ Error in clearLocker",
      functionName: "clearLocker",
      req,
    });
    return res
      .status(500)
      .send({ error: error?.message, spawnSuccess: false, success: false });
  }
};
