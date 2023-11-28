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
