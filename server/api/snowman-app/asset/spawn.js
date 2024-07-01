import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";
import { addNewRowToGoogleSheets } from "../../addNewRowToGoogleSheets.js";

let BASE_URL;

export const spawn = async (req, res) => {
  try {
    const protocol = process.env.INSTANCE_PROTOCOL;
    const host = req.host;
    const port = req.port;

    if (host === "localhost") {
      BASE_URL = `https://snowman0-prod-Topia.topia-rtsdk.com`;
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

    const world = await World.create(urlSlug, { credentials });
    const background = (
      await world.fetchDroppedAssetsWithUniqueName({
        uniqueName: `snowman-background`,
      })
    )?.[0];

    const spawnPosition = getRandomPosition({
      x: background?.position?.x,
      y: background?.position?.y,
    });

    await removeAllUserAssets(urlSlug, visitor, credentials);

    const spawnedAsset = await dropImageAsset({
      urlSlug,
      credentials,
      visitor,
      req,
      completeImageName,
      uniqueName,
      spawnPosition,
    });

    return res.json({
      spawnSuccess: true,
      success: true,
      isAssetSpawnedInWorld: true,
      completeImageName,
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
  uniqueName: parentUniqueName,
  spawnPosition,
}) {
  const { interactivePublicKey, profileId, assetId } = credentials;

  const { bottomLayer, toplayer } = getAssetImgUrl(req);

  const { moveTo, username } = visitor;
  const { x, y } = moveTo;

  const spawnedAssetUniqueName = `assetSystem-${visitor?.profileId}`;

  const asset = await Asset.create(process.env.IMG_ASSET_ID, { credentials });

  const assetSpawnedDroppedAsset = await DroppedAsset.drop(asset, {
    position: spawnPosition,
    uniqueName: spawnedAssetUniqueName,
    urlSlug,
    isInteractive: true,
    interactivePublicKey,
  });

  await assetSpawnedDroppedAsset?.updateDataObject(
    {
      profileId,
      completeImageName,
      parentAssetId: assetId,
    },
    {
      analytics: [
        {
          analyticName: `snowman-builds`,
          uniqueKey: visitor?.profileId,
          profileId: visitor?.profileId,
        },
      ],
    }
  );

  addNewRowToGoogleSheets({
    identityId: req?.query?.identityId,
    displayName: req?.query?.displayName,
    appName: "Build an Asset",
    event: "snowman-starts",
    urlSlug,
  })
    .then()
    .catch((error) => console.error(JSON.stringify(error)));

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

  await assetSpawnedDroppedAsset?.updateWebImageLayers(bottomLayer, toplayer);

  return assetSpawnedDroppedAsset;
}

function getAssetImgUrl(req) {
  const { completeImageName } = req.body;
  const bottomLayer = null;
  const toplayer = `${BASE_URL}/assets/snowman/output/${completeImageName}`;
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
