import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

let BASE_URL;

export const renameLocker = async (req, res) => {
  try {
    const protocol = process.env.INSTANCE_PROTOCOL;
    const host = req.host;
    const port = req.port;

    if (host === "localhost") {
      BASE_URL = `http://localhost:3001`;
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

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };
    const completeImageName = "unclaimedLocker.png";

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

    const position = droppedAsset.position;

    // if (
    //   visitor?.privateZoneId != droppedAsset?.id &&
    //   visitor?.privateZoneId != droppedAsset?.dataObject?.parentAssetId
    // ) {
    //   return res.json({ spawnSuccess: false, success: false });
    // }

    // snowman placa x:0 y:200
    // superior direita: x 600   y -500
    // superior esquerda x: -600
    const world = await World.create(urlSlug, { credentials });
    // const background = (
    //   await world.fetchDroppedAssetsWithUniqueName({
    //     uniqueName: `locker-background`,
    //   })
    // )?.[0];

    // const spawnPosition = getRandomPosition({
    //   x: background?.position?.x,
    //   y: background?.position?.y,
    // });

    const spawnPosition = {
      x: position.x,
      y: position.y - 20,
    };

    const spawnedAsset = await dropImageAsset({
      urlSlug,
      credentials,
      visitor,
      req,
      completeImageName,
      uniqueName,
      spawnPosition,
    });

    await droppedAsset.deleteDroppedAsset();

    return res.json({
      spawnSuccess: true,
      success: true,
      isAssetSpawnedInWorld: true,
      spawnedAsset,
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

async function dropImageAsset({
  urlSlug,
  credentials,
  visitor,
  req,
  completeImageName,
  uniqueName: parentUniqueName,
  spawnPosition,
}) {
  const { bottomLayer, toplayer } = getAssetImgUrl(req);

  const { moveTo, username } = visitor;
  // const { x, y } = moveTo;

  const spawnedAssetUniqueName = `lockerSystem-${visitor?.profileId}`;

  const asset = await Asset.create(process.env.IMG_ASSET_ID, { credentials });

  const assetSpawnedDroppedAsset = await DroppedAsset.drop(asset, {
    position: spawnPosition,
    uniqueName: spawnedAssetUniqueName,
    urlSlug,
  });

  const modifiedName = username.replace(/ /g, "%20");

  const clickableLink = `${BASE_URL}/locker`;

  await assetSpawnedDroppedAsset?.updateClickType({
    clickType: "link",
    clickableLink,
    clickableLinkTitle: "Locker",
    clickableDisplayTextDescription: "Locker",
    clickableDisplayTextHeadline: "Locker",
    isOpenLinkInDrawer: true,
  });

  await assetSpawnedDroppedAsset?.setInteractiveSettings({
    isInteractive: true,
    interactivePublicKey: process.env.INTERACTIVE_KEY,
  });

  await assetSpawnedDroppedAsset?.updateWebImageLayers(bottomLayer, toplayer);

  return assetSpawnedDroppedAsset;
}

function getAssetImgUrl(req) {
  const bottomLayer = `https://snowman-dev-topia.topia-rtsdk.com/assets/locker/output/locker_bottom_layer.png`;
  const toplayer = `https://snowman-dev-topia.topia-rtsdk.com/assets/locker/output/unclaimedLocker.png`;
  return { bottomLayer, toplayer };
}
