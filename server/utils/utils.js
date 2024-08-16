import { Visitor, DroppedAsset, World } from "./topiaInit.js";

export async function fetchIsSpawnedAssetInWorld(
  urlSlug,
  visitor,
  credentials
) {
  try {
    const world = await World.create(urlSlug, { credentials });

    const spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `assetSystem-${visitor?.profileId}`,
    });

    if (spawnedAssets && spawnedAssets.length) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(
      "❌ Error in fetchIsSpawnedAssetInWorld.",
      JSON.stringify(error)
    );
  }
}

export function getBaseUrl(req) {
  const host = req.host;
  const port = req.port;

  let BASE_URL;
  let DEFAULT_URL_FOR_IMAGE_HOSTING;
  try {
    if (host === "localhost") {
      BASE_URL = `http://localhost:3001`;
      DEFAULT_URL_FOR_IMAGE_HOSTING =
        "https://snowman-dev-topia.topia-rtsdk.com";
    } else {
      BASE_URL = `${protocol}://${host}`;
      DEFAULT_URL_FOR_IMAGE_HOSTING = BASE_URL;
    }
    return { BASE_URL, DEFAULT_URL_FOR_IMAGE_HOSTING };
  } catch (error) {
    console.error("❌ Error in getBaseUrl.", JSON.stringify(error));
  }
}

export const getS3URL = () => {
  return `https://${
    process.env.S3_BUCKET_BUILD_AN_ASSET || "sdk-build-an-asset"
  }.s3.amazonaws.com`;
};

export async function isAssetInWorld(urlSlug, visitor, credentials) {
  const world = await World.create(urlSlug, { credentials });
  let assetAssets = null;
  try {
    assetAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `assetSystem-${visitor?.username}`,
    });
  } catch (error) {
    console.error("❌ Error in isAssetInWorld function", JSON.stringify(error));
  }

  if (visitor?.dataObject?.asset) {
    return !!(assetAssets && assetAssets.length);
  }

  return false;
}

export function canPerformAction(
  lastActionTime,
  currentTime,
  minTimeBetweenActions
) {
  const timeSinceLastAction = currentTime - lastActionTime;
  return !(lastActionTime && timeSinceLastAction < minTimeBetweenActions);
}
