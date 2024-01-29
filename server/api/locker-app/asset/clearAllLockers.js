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

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    const world = await World.create(urlSlug, { credentials });

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });
    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
      visitor.fetchVisitor(),
      visitor.fetchDataObject(),
    ]);

    let spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `lockerSystem-0`,
    });

    spawnedAssets = spawnedAssets.filter((asset) => asset !== null);

    const promises = spawnedAssets.map(async (asset) => {
      try {
        await asset.fetchDataObject();
        await asset.setDataObject(null);
        await asset.setDataObject({});

        await world.updateDataObject({
          lockers: null,
        });

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

    await Promise.all(promises);

    return res.json({
      droppedAsset,
      visitor,
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
