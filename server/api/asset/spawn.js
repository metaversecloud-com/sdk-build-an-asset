import { DroppedAsset, Visitor, Asset, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

let BASE_URL;

export const spawn = async (req, res) => {
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

    if (visitor?.privateZoneId != droppedAsset?.id) {
      return res.json({ spawnSuccess: false, success: false });
    }

    await removeAllUserAssets(urlSlug, visitor, credentials);

    await dropImageAsset({
      urlSlug,
      credentials,
      visitor,
      req,
      completeImageName,
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

async function removeAllUserAssets(urlSlug, visitor, credentials) {
  const world = await World.create(urlSlug, { credentials });

  try {
    const spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `assetSystem-${visitor?.profileId}`,
    });

    if (spawnedAssets && spawnedAssets.length) {
      await Promise.all(
        spawnedAssets.map((spawnedAsset) => spawnedAsset.deleteDroppedAsset())
      );
    }
  } catch (error) {
    console.error(
      "❌ There are no assets to be deleted.",
      JSON.stringify(error)
    );
  }
}

async function dropImageAsset({
  urlSlug,
  credentials,
  visitor,
  req,
  completeImageName,
}) {
  const { visitorId, interactiveNonce, interactivePublicKey } = credentials;

  const { assetImgUrlLayer0, assetImgUrlLayer1 } = getAssetImgUrl(req);

  const { moveTo, username } = visitor;
  const { x, y } = moveTo;
  const position = {
    x: x + 100,
    y: y,
  };
  const uniqueName = `assetSystem-${visitor?.profileId}`;

  const asset = await Asset.create(process.env.IMG_ASSET_ID, { credentials });

  const assetSpawnedDroppedAsset = await DroppedAsset.drop(asset, {
    position,
    uniqueName,
    urlSlug,
  });

  await assetSpawnedDroppedAsset?.updateDataObject({
    profileId: visitor?.profileId,
    completeImageName,
  });

  const modifiedName = username.replace(/ /g, "%20");

  const clickableLink = `${BASE_URL}/spawned/img-name/${completeImageName}/visitor-name/${modifiedName}`;

  await assetSpawnedDroppedAsset?.updateClickType({
    clickType: "link",
    clickableLink,
    clickableLinkTitle: "Snowman",
    clickableDisplayTextDescription: "Snowman",
    clickableDisplayTextHeadline: "Snowman",
    isOpenLinkInDrawer: true,
  });

  await assetSpawnedDroppedAsset?.setInteractiveSettings({
    isInteractive: true,
    interactivePublicKey: process.env.INTERACTIVE_KEY,
  });

  await assetSpawnedDroppedAsset?.updateWebImageLayers(
    assetImgUrlLayer0,
    assetImgUrlLayer1
  );

  return assetSpawnedDroppedAsset;
}

function getAssetImgUrl(req) {
  const { completeImageName } = req.body;
  const assetImgUrlLayer0 = `${BASE_URL}/assets/snowman/output/${completeImageName}`;
  const assetImgUrlLayer1 = null;
  return { assetImgUrlLayer0, assetImgUrlLayer1 };
}
