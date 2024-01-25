import { logger } from "../../../logs/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import {
  getBaseUrl,
  processRequestQuery,
  validateImageInfo,
} from "./requestHandlers.js";
import { generateS3Url, generateImageInfoParam } from "./imageUtils.js";

import { createAndFetchEntities } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let BASE_URL;

export const editLocker = async (req, res) => {
  try {
    BASE_URL = getBaseUrl(req);
    const { assetId, imageInfo, urlSlug, visitorId, credentials } =
      processRequestQuery(req);

    if (!validateImageInfo(imageInfo, res)) return;

    const { visitor, droppedAsset } = await createAndFetchEntities({
      assetId,
      urlSlug,
      visitorId,
      credentials,
    });

    // Claim Locker if It's not claimed yet
    if (!droppedAsset?.dataObject?.profileId) {
      await claimLocker({ droppedAsset, visitor, credentials });
    }

    const s3Url = await generateS3Url(imageInfo, visitor);
    await updateDroppedAsset(
      droppedAsset,
      s3Url,
      visitor,
      imageInfo,
      credentials
    );

    return res.json({
      spawnSuccess: true,
      success: true,
      isAssetSpawnedInWorld: true,
      imageInfo: imageInfo,
      spawnedAsset: droppedAsset,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while editing the locker",
      functionName: "editLocker",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};

async function updateDroppedAsset(
  droppedAsset,
  s3Url,
  visitor,
  imageInfo,
  credentials
) {
  await droppedAsset.setDataObject({ s3Url });
  await droppedAsset.updateWebImageLayers("", s3Url);

  const modifiedName = visitor.username.replace(/ /g, "%20");
  const imageInfoParam = generateImageInfoParam(imageInfo);
  const clickableLink = `${BASE_URL}/locker/spawned?${imageInfoParam}&visitor-name=${modifiedName}`;

  await droppedAsset.updateClickType({
    clickType: "link",
    clickableLink,
    clickableLinkTitle: "Locker",
    clickableDisplayTextDescription: "Locker",
    clickableDisplayTextHeadline: "Locker",
    isOpenLinkInDrawer: true,
  });

  await droppedAsset.updateDataObject({
    profileId: visitor.profileId,
    imageInfo,
    parentAssetId: credentials.assetId,
  });
}

async function claimLocker({ droppedAsset, visitor, credentials }) {
  const { username } = visitor;

  const modifiedName = username.replace(/ /g, "%20");

  const completeImageName = "unclaimedLocker.png";
  const redirectPath = `locker/spawned?visitor-name=${modifiedName}`;
  const clickableLink = `${BASE_URL}/${redirectPath}`;

  await droppedAsset?.updateClickType({
    clickType: "link",
    clickableLink,
    clickableLinkTitle: "Locker",
    clickableDisplayTextDescription: "Locker",
    clickableDisplayTextHeadline: "Locker",
    isOpenLinkInDrawer: true,
  });

  await droppedAsset?.updateDataObject({
    profileId: visitor?.profileId,
    completeImageName,
    parentAssetId: credentials?.assetId,
  });
}
