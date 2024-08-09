import { World } from "../../../utils/topiaInit.js";

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
