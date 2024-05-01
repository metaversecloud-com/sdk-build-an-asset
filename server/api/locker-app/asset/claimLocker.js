import { logger } from "../../../logs/logger.js";
import { getBaseUrl, validateImageInfo } from "./requestHandlers.js";
import { generateS3Url, generateImageInfoParam } from "./imageUtils.js";
import { DroppedAsset, World } from "../../topiaInit.js";

export const claimLocker = async (req, res) => {
  try {
    const { baseUrl, defaultUrlForImageHosting } = getBaseUrl(req);

    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
      profileId,
      username,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    // Check if this locker is taken
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

    const s3Url = `${defaultUrlForImageHosting}/assets/locker/output/defaultClaimedLocker.png`;

    try {
      await world.updateDataObject(
        {
          [`lockers.${profileId}`]: { droppedAssetId: assetId, s3Url },
        },
        {
          lock: {
            lockId: `${assetId}-${new Date(
              Math.round(new Date().getTime() / 10000) * 10000
            )}`,
          },
        }
      );
    } catch (error) {
      return res.json({
        msg: "This locker is already taken",
        isLockerAlreadyTaken: true,
      });
    }

    const modifiedName = username.replace(/ /g, "%20");

    if (!modifiedName || !profileId) {
      return res.status(400).json({ error: "modifiedName or profileId" });
    }

    const clickableLink = `${baseUrl}/locker/claimed?visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    // TODO: remove need for update clickType
    await Promise.all([
      droppedAsset.updateWebImageLayers("", s3Url),
      droppedAsset.updateClickType({
        clickType: "link",
        clickableLink,
        clickableLinkTitle: "Locker",
        clickableDisplayTextDescription: "Locker",
        clickableDisplayTextHeadline: "Locker",
        isOpenLinkInDrawer: true,
      }),
    ]);

    return res.json({
      success: true,
      spawnedAsset: droppedAsset,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while claming the locker",
      functionName: "claimLocker",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};
