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
      ownerProfileId,
      profileId,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const { isClearOwnerAsset } = req.body;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    let lockerAssetId;

    if (isClearOwnerAsset) {
      lockerAssetId = world?.dataObject?.lockers?.[profileId]?.droppedAssetId;
    } else {
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

function findUserLocker(world, assetId, profileId) {
  if (world.dataObject.lockers) {
    const claimedLockers = Object.entries(world.dataObject.lockers).reduce(
      (claimedLockers, [ownerProfileId, locker]) => {
        if (
          locker &&
          locker.droppedAssetId === assetId &&
          ownerProfileId !== profileId
        ) {
          return locker;
        }
        return claimedLockers;
      },
      {}
    );

    if (Object.keys(claimedLockers).length) {
      return res.json({
        msg: "This locker is already taken",
        isLockerAlreadyTaken: true,
      });
    }
  }
}
