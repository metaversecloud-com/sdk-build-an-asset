import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";
import { getBaseUrl } from "./requestHandlers.js";

export const spawnLocker = async (req, res) => {
  try {
    const { baseUrl } = getBaseUrl(req);

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

    const world = await World.create(urlSlug, { credentials });

    const spawnPosition = getRandomPosition({
      x: 0,
      y: 0,
    });

    const spawnedAsset = await dropImageAsset({
      urlSlug,
      credentials,
      visitor,
      req,
      completeImageName,
      uniqueName,
      spawnPosition,
      baseUrl,
    });

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
  baseUrl,
}) {
  const { visitorId, interactiveNonce, interactivePublicKey } = credentials;

  const { bottomLayer, toplayer } = getAssetImgUrl(req, baseUrl);

  const { moveTo, username } = visitor;
  // const { x, y } = moveTo;
  const x = 0;
  const y = 0;
  spawnPosition = { x, y };
  const spawnedAssetUniqueName = `lockerSystem-${visitor?.profileId}`;

  const asset = await Asset.create(process.env.IMG_ASSET_ID, { credentials });

  const assetSpawnedDroppedAsset = await DroppedAsset.drop(asset, {
    position: spawnPosition,
    uniqueName: spawnedAssetUniqueName,
    urlSlug,
  });

  await assetSpawnedDroppedAsset?.updateDataObject({
    profileId: visitor?.profileId,
    completeImageName,
    parentAssetId: credentials?.assetId,
    parentUniqueName,
  });

  const modifiedName = username.replace(/ /g, "%20");

  const clickableLink = `${baseUrl}/locker/spawned/img-name/${completeImageName}/visitor-name/${modifiedName}`;

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

function getAssetImgUrl(req, baseUrl) {
  const bottomLayer = null;
  const toplayer = `${baseUrl}/assets/locker/output/unclaimedLocker.png`;
  return { bottomLayer, toplayer };
}

function getRandomPosition(position) {
  const randomX = Math.floor(Math.random() * 1201) - 600;

  const randomY = -(Math.floor(Math.random() * 1301) - 750);

  return {
    x: position.x + randomX,
    y: position.y + randomY,
  };
}
