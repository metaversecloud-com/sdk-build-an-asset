import { Credentials } from "../types/index.js";
import { getBaseUrl } from "./getBaseUrl.js";
import { getS3URL } from "./images/getS3URL.js";
import { DroppedAsset } from "./topiaInit.js";

/**
 * Resets a claimed sign (locker, desk) back to its unclaimed image and link.
 */
export const releaseClaimedAsset = async ({
  credentials,
  droppedAssetId,
  hostname,
}: {
  credentials: Credentials;
  droppedAssetId: string;
  hostname: string;
}) => {
  const { themeName, urlSlug } = credentials;
  const droppedAsset = DroppedAsset.create(droppedAssetId, urlSlug, { credentials });
  await Promise.all([
    droppedAsset.updateWebImageLayers("", `${getS3URL(themeName)}/unclaimedAsset.png`),
    droppedAsset.updateClickType({ clickableLink: `${getBaseUrl(hostname)}/${themeName}`, clickableLinkTitle: themeName }),
  ]);
};
