import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export async function createEntities({
  assetId,
  urlSlug,
  visitorId,
  credentials,
}) {
  const visitor = Visitor.create(visitorId, urlSlug, { credentials });
  const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
    credentials,
  });
  return { visitor, droppedAsset };
}

export async function fetchEntitiesData(visitor, droppedAsset) {
  await Promise.all([
    droppedAsset.fetchDroppedAssetById(),
    droppedAsset.fetchDataObject(),
    visitor.fetchVisitor(),
    visitor.fetchDataObject(),
  ]);
}

export async function createAndFetchEntities({
  assetId,
  urlSlug,
  visitorId,
  credentials,
}) {
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

  return { visitor, droppedAsset };
}
