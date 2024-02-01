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
      profileId,
    } = req.query;

    let { ownerProfileId } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const { isClearMyLockerFromUnclaimedLocker } = req.body;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    let lockerAssetId;

    if (isClearMyLockerFromUnclaimedLocker) {
      lockerAssetId = world?.dataObject?.lockers?.[profileId]?.droppedAssetId;
      ownerProfileId = profileId;
    } else {
      // Admin route
      // TODO: verification here
      lockerAssetId = assetId;
    }

    const { baseUrl, defaultUrlForImageHosting } = getBaseUrl(req);

    const droppedAsset = DroppedAsset.create(lockerAssetId, urlSlug, {
      credentials,
    });

    const toplayer = `${defaultUrlForImageHosting}/assets/locker/output/unclaimedLocker.png`;

    const clickableLink = `${baseUrl}/locker`;

    // TODO: remove need for update clickType
    await Promise.all([
      droppedAsset?.updateWebImageLayers("", toplayer),
      droppedAsset?.updateClickType({
        clickType: "link",
        clickableLink,
        clickableLinkTitle: "Locker",
        clickableDisplayTextDescription: "Locker",
        clickableDisplayTextHeadline: "Locker",
        isOpenLinkInDrawer: true,
      }),
      world.updateDataObject({
        [`lockers.${ownerProfileId}`]: null,
      }),
    ]);

    return res.json({
      success: true,
      world,
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
