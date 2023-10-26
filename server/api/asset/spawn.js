import { DroppedAsset, Visitor, Asset, World } from "../topiaInit.js";
import { logger } from "../../logs/logger.js";

let BASE_URL;

export const spawn = async (req, res) => {
  try {
    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
    } = req.query;

    const protocol = process.env.INSTANCE_PROTOCOL;
    const host = req.host;
    const port = req.port;

    if (host === "localhost") {
      BASE_URL = `${protocol}://sdk-build-an-asset.topia-rtsdk.com`;
    } else {
      BASE_URL = `${protocol}://${host}`;
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

    const asset = visitor?.dataObject?.asset;

    await removeAllUserAssets(urlSlug, visitor, credentials);

    await dropImageAsset(urlSlug, credentials, visitor);

    return res.json({ success: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🐰 Error while spawning the asset",
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

async function dropImageAsset(urlSlug, credentials, visitor) {
  const { visitorId, interactiveNonce, interactivePublicKey } = credentials;

  const { assetImgUrlLayer0, assetImgUrlLayer1 } = getAssetImgUrl();

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

  await assetSpawnedDroppedAsset?.updateClickType({
    clickType: "link",
    clickableLink: `${BASE_URL}/asset-type/spawned?visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetSpawnedDroppedAsset?.id}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}`,
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

function getAssetImgUrl() {
  // assetImgUrlLayer0 = `${BASE_URL}/assets/dragon/world/D3_Layer0.png`;
  // assetImgUrlLayer1 = `${BASE_URL}/assets/dragon/world/D3_Layer1.png`;
  // return { assetImgUrlLayer0, assetImgUrlLayer1 };
}
