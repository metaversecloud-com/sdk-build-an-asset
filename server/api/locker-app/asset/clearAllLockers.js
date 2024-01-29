import { Visitor, DroppedAsset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";
import { getBaseUrl } from "./requestHandlers.js";

export const clearAllLockers = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const { baseUrl, defaultUrlForImageHosting } = getBaseUrl(req);
    const world = await World.create(urlSlug, { credentials });

    let spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `lockerSystem-0`,
    });

    spawnedAssets = spawnedAssets.filter((asset) => asset !== null);

    // TODO: remove need for update clickType
    const promises = spawnedAssets.map(async (asset) => {
      try {
        const toplayer = `${defaultUrlForImageHosting}/assets/locker/output/unclaimedLocker.png`;
        await asset.updateWebImageLayers("", toplayer);

        const clickableLink = `${baseUrl}/locker`;
        await asset.updateClickType({
          clickType: "link",
          clickableLink,
          clickableLinkTitle: "Locker",
          clickableDisplayTextDescription: "Locker",
          clickableDisplayTextHeadline: "Locker",
          isOpenLinkInDrawer: true,
        });

        return asset;
      } catch (error) {
        console.error(`❌ Error modifying asset: ${error}`);
      }
    });

    promises.push(
      world.updateDataObject({
        lockers: null,
      })
    );

    await Promise.all(promises);

    return res.json({
      success: true,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error in clearAllLockers",
      functionName: "clearAllLockers",
      req,
    });
    return res.status(500).send({ error, success: false });
  }
};
