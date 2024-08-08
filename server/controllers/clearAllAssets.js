import { World } from "../utils/topiaInit.js";
import { getBaseUrl } from "./requestHandlers.js";
import { getS3URL } from "../utils/utils.js";
import { logger } from "../logs/logger.js";
import { capitalize } from "../utils/captalize.js";

export const clearAllAssets = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
      themeName,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const { baseUrl } = getBaseUrl(req);
    const world = await World.create(urlSlug, { credentials });

    let spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `${themeName}System-0`,
    });

    // TODO: remove need for update clickType
    const toplayer = `${getS3URL()}/${themeName}/unclaimed${capitalize(
      themeName
    )}.png`;

    const clickableLink = `${baseUrl}/${themeName}`;
    const promises = [];
    spawnedAssets.map(async (asset) => {
      promises.push(asset.updateWebImageLayers("", toplayer));
      promises.push(
        asset.updateClickType({
          clickType: "link",
          clickableLink,
          clickableLinkTitle: themeName,
          clickableDisplayTextDescription: themeName,
          clickableDisplayTextHeadline: themeName,
          isOpenLinkInDrawer: true,
        })
      );
    });

    promises.push(
      world.updateDataObject(
        { [themeName]: {} },
        { analytics: [{ analyticName: `${themeName}-resets` }] }
      )
    );

    await Promise.allSettled(promises);

    return res.json({
      success: true,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error in clearAllAssets",
      functionName: "clearAllAssets",
      req,
    });
    return res.status(500).send({ error, success: false });
  }
};
