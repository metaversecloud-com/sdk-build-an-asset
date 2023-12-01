import { DroppedAsset, Visitor, Asset, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

let BASE_URL;

export const spawnFromSpawnedAsset = async (req, res) => {
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

    if (
      visitor?.privateZoneId != droppedAsset?.id &&
      visitor?.privateZoneId != droppedAsset?.dataObject?.parentAssetId
    ) {
      return res.json({ spawnSuccess: false, success: false });
    }

    // await removeAllUserAssets(urlSlug, visitor, credentials);

    await updateImageAsset({
      urlSlug,
      credentials,
      visitor,
      req,
      completeImageName,
      uniqueName,
      droppedAsset,
    });

    return res.json({ spawnSuccess: true, success: true });
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

async function updateImageAsset({
  urlSlug,
  credentials,
  visitor,
  req,
  completeImageName,
  uniqueName: parentUniqueName,
  droppedAsset,
}) {
  const { visitorId, interactiveNonce, interactivePublicKey } = credentials;

  const { assetImgUrlLayer0, assetImgUrlLayer1 } = getAssetImgUrl(req);

  const { moveTo, username } = visitor;
  const { x, y } = moveTo;
  const position = {
    x: x + 100,
    y: y,
  };

  await droppedAsset?.updateDataObject({
    completeImageName,
  });

  const modifiedName = username.replace(/ /g, "%20");

  const clickableLink = `${BASE_URL}/spawned/img-name/${completeImageName}/visitor-name/${modifiedName}`;

  await droppedAsset?.updateClickType({
    clickType: "link",
    clickableLink,
    clickableLinkTitle: "Snowman",
    clickableDisplayTextDescription: "Snowman",
    clickableDisplayTextHeadline: "Snowman",
    isOpenLinkInDrawer: true,
  });

  await droppedAsset?.updateWebImageLayers(
    assetImgUrlLayer0,
    assetImgUrlLayer1
  );

  await droppedAsset?.updatePosition(position?.x, position?.y, 0);

  return droppedAsset;
}

function getAssetImgUrl(req) {
  const { completeImageName } = req.body;
  const assetImgUrlLayer0 = `${BASE_URL}/assets/snowman/output/${completeImageName}`;
  const assetImgUrlLayer1 = null;
  return { assetImgUrlLayer0, assetImgUrlLayer1 };
}
