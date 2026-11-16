import { DroppedAssetInterface } from "@rtsdk/topia";
import { WorldDataObject } from "../types/index.js";

export const MAX_DROPPED_ASSETS_OPTIONS = [50, 200, 500];

/**
 * Picks the oldest dropped assets to remove so that, once the new asset is dropped,
 * the theme stays at or below `maxDroppedAssets`.
 *
 * `otherDroppedAssets` must exclude the dropping user's own previous asset(s) since
 * those are always replaced. Age comes from `droppedAt` in the world data object;
 * assets without one (dropped before the cap existed, or missing from the data object)
 * are treated as the oldest.
 */
export const getDroppedAssetsToEvict = ({
  dataObject,
  maxDroppedAssets,
  otherDroppedAssets,
  themeName,
}: {
  dataObject: WorldDataObject;
  maxDroppedAssets?: number | null;
  otherDroppedAssets: DroppedAssetInterface[];
  themeName: string;
}): { droppedAsset: DroppedAssetInterface; ownerProfileId?: string }[] => {
  if (!maxDroppedAssets) return [];

  const evictCount = otherDroppedAssets.length + 1 - maxDroppedAssets;
  if (evictCount <= 0) return [];

  const ownersByDroppedAssetId: { [droppedAssetId: string]: { ownerProfileId: string; droppedAt: number } } = {};
  for (const [ownerProfileId, entry] of Object.entries(dataObject?.[themeName] || {})) {
    if (entry?.droppedAssetId) {
      ownersByDroppedAssetId[entry.droppedAssetId] = { ownerProfileId, droppedAt: entry.droppedAt || 0 };
    }
  }

  return otherDroppedAssets
    .map((droppedAsset) => ({
      droppedAsset,
      ownerProfileId: ownersByDroppedAssetId[droppedAsset.id!]?.ownerProfileId,
      droppedAt: ownersByDroppedAssetId[droppedAsset.id!]?.droppedAt || 0,
    }))
    .sort((a, b) => a.droppedAt - b.droppedAt)
    .slice(0, evictCount)
    .map(({ droppedAsset, ownerProfileId }) => ({ droppedAsset, ownerProfileId }));
};
