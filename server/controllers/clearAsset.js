import { DroppedAsset, World } from "../utils/topiaInit.js";
import { getBaseUrl } from "./requestHandlers.js";
import { getS3URL } from "../utils/utils.js";
import { logger } from "../logs/logger.js";
import { capitalize } from "../utils/captalize.js";

export const clearAsset = async (req, res) => {
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

    const { isClearAssetFromUnclaimedAsset } = req.body;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    let selectedAssetId;

    if (isClearAssetFromUnclaimedAsset) {
      selectedAssetId =
        world?.dataObject?.[themeName]?.[profileId]?.droppedAssetId;
      ownerProfileId = profileId;
    } else {
      selectedAssetId = assetId;
    }

    const { baseUrl } = getBaseUrl(req);

    const droppedAsset = DroppedAsset.create(selectedAssetId, urlSlug, {
      credentials,
    });

    const toplayer = `${getS3URL()}/${themeName}/unclaimedAsset.png`;

    const clickableLink = `${baseUrl}/${themeName}`;

    // TODO: remove need for update clickType
    await Promise.all([
      droppedAsset?.updateWebImageLayers("", toplayer),
      droppedAsset?.updateClickType({
        clickType: "link",
        clickableLink,
        clickableLinkTitle: themeName,
        clickableDisplayTextDescription: themeName,
        clickableDisplayTextHeadline: themeName,
        isOpenLinkInDrawer: true,
      }),
      world.updateDataObject(
        {
          [`${themeName}.${ownerProfileId}`]: null,
        },
        {
          analytics: [
            {
              analyticName: `${themeName}-unclaims`,
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
      message: "❌ Error in clearAsset",
      functionName: "clearAsset",
      req,
    });
    return res
      .status(500)
      .send({ error: error?.message, spawnSuccess: false, success: false });
  }
};
