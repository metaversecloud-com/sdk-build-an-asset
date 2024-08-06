import { DroppedAsset, World } from "../utils/topiaInit.js";
import { getBaseUrl } from "./requestHandlers.js";
import { getS3URL } from "../utils/utils.js";
import { logger } from "../logs/logger.js";

export const clearLocker = async (req, res) => {
  try {
    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
      profileId,
      themeName,
    } = req.query;

    let { ownerProfileId } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const { isClearAssetFromUnclaimedLocker } = req.body;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    let lockerAssetId;

    if (isClearAssetFromUnclaimedLocker) {
      lockerAssetId = world?.dataObject?.lockers?.[profileId]?.droppedAssetId;
      ownerProfileId = profileId;
    } else {
      lockerAssetId = assetId;
    }

    const { baseUrl } = getBaseUrl(req);

    const droppedAsset = DroppedAsset.create(lockerAssetId, urlSlug, {
      credentials,
    });

    const toplayer = `${getS3URL()}/unclaimedLocker.png`;

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
      world.updateDataObject(
        {
          [`lockers.${ownerProfileId}`]: null,
        },
        {
          analytics: [
            {
              analyticName: `locker-unclaims`,
              profileId,
              uniqueKey: profileId,
            },
          ],
        }
      ),
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
