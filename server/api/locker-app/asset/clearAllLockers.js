import { Visitor, DroppedAsset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

let BASE_URL;
let DEFAULT_URL_FOR_IMAGE_HOSTING = null;

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

    const protocol = process.env.INSTANCE_PROTOCOL;
    const host = req.host;
    const port = req.port;

    if (host === "localhost") {
      BASE_URL = `http://localhost:3001`;
      DEFAULT_URL_FOR_IMAGE_HOSTING =
        "https://locker0-dev-topia.topia-rtsdk.com";
    } else {
      BASE_URL = `${protocol}://${host}`;
      DEFAULT_URL_FOR_IMAGE_HOSTING = BASE_URL;
    }

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

        const toplayer = `${DEFAULT_URL_FOR_IMAGE_HOSTING}/assets/locker/output/unclaimedLocker.png`;
        await asset.updateWebImageLayers("", toplayer);

        const clickableLink = `${BASE_URL}/locker`;
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
