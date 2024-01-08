import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

let BASE_URL;

export const editLocker = async (req, res) => {
  try {
    const protocol = process.env.INSTANCE_PROTOCOL;
    const host = req.host;
    const port = req.port;

    if (host === "localhost") {
      BASE_URL = `https://snowman-dev-topia.topia-rtsdk.com`;
    } else {
      BASE_URL = `${protocol}://${host}`;
    }

    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
      uniqueName,
    } = req.query;

    const { completeImageName } = req.body;

    if (!completeImageName) {
      return res.status(400).json({
        msg: "Input data missing. Please fill the the follow field: completeImageName",
      });
    }

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
      visitor.fetchVisitor(),
      visitor.fetchDataObject(),
    ]);

    const { username } = visitor;

    const { bottomLayer, toplayer } = getAssetImgUrl(req);
    await droppedAsset?.updateWebImageLayers(bottomLayer, toplayer);

    const modifiedName = username.replace(/ /g, "%20");

    // To Do fix it..
    // const clickableLink = `${BASE_URL}/locker/spawned/img-name/${completeImageName}/visitor-name/${modifiedName}`;
    const clickableLink = `http://localhost:3001/locker/spawned/img-name/${completeImageName}/visitor-name/${modifiedName}`;

    await droppedAsset?.updateClickType({
      clickType: "link",
      clickableLink,
      clickableLinkTitle: "Locker",
      clickableDisplayTextDescription: "Locker",
      clickableDisplayTextHeadline: "Locker",
      isOpenLinkInDrawer: true,
    });

    await droppedAsset?.updateDataObject({
      profileId: visitor?.profileId,
      completeImageName,
      parentAssetId: credentials?.assetId,
    });

    return res.json({
      spawnSuccess: true,
      success: true,
      isAssetSpawnedInWorld: true,
      completeImageName,
      spawnedAsset: droppedAsset,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while spawning the asset",
      functionName: "spawn",
      req,
    });
    return res
      .status(500)
      .send({ error: error?.message, spawnSuccess: false, success: false });
  }
};

function getAssetImgUrl(req) {
  const { completeImageName } = req.body;
  const bottomLayer = null;
  const toplayer = `${BASE_URL}/assets/locker/output/${completeImageName}`;
  return { bottomLayer, toplayer };
}
