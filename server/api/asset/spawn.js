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

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials,
    });

    await visitor.fetchDataObject();

    await removeAllUserAssets(urlSlug, visitor, credentials);

    await dropImageAsset({
      urlSlug,
      credentials,
      visitor,
      req,
      completeImageName,
    });

    return res.json({ isSpawnedInWorld: true, success: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while spawning the asset",
      functionName: "spawn",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};

async function removeAllUserAssets(urlSlug, visitor, credentials) {
  const world = await World.create(urlSlug, { credentials });

  try {
    const spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `assetSystem-${visitor?.username}`,
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
  const uniqueName = `assetSystem-${username}`;

  const asset = await Asset.create(process.env.IMG_ASSET_ID, { credentials });

  const assetSpawnedDroppedAsset = await DroppedAsset.drop(asset, {
    position,
    uniqueName,
    urlSlug,
  });

  await assetSpawnedDroppedAsset?.updateDataObject({
    profileId: visitor?.profileId,
  });

  const clickableLink = `${BASE_URL}/spawned/img-name/${username}/visitor-name/${completeImageName}`;

  await assetSpawnedDroppedAsset?.updateClickType({
    clickType: "link",
    // clickableLink: `${BASE_URL}/spawned?visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetSpawnedDroppedAsset?.id}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}`,
    clickableLink: `${BASE_URL}/spawned/visitor-name/${username}/img-name/${completeImageName}`,
    clickableLinkTitle: "Generated Asset",
    clickableDisplayTextDescription: "Generated Asset",
    clickableDisplayTextHeadline: "Generated Asset",
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
  const assetImgUrlLayer0 = `${BASE_URL}/assets/output/${completeImageName}`;
  // assetImgUrlLayer1 = assetImgUrlLayer0;
  const assetImgUrlLayer1 = null;
  return { assetImgUrlLayer0, assetImgUrlLayer1 };
}
