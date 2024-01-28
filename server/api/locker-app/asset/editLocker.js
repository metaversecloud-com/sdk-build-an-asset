import { logger } from "../../../logs/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import {
  getBaseUrl,
  processRequestQuery,
  validateImageInfo,
} from "./requestHandlers.js";
import { generateS3Url, generateImageInfoParam } from "./imageUtils.js";
import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";

import { createAndFetchEntities } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let BASE_URL;

export const editLocker = async (req, res) => {
  try {
    BASE_URL = getBaseUrl(req);

    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
      uniqueName,
      profileId,
    } = req.query;

    const { imageInfo } = req.body;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    if (!validateImageInfo(imageInfo, res)) return;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    const { visitor, droppedAsset } = await createAndFetchEntities({
      assetId,
      urlSlug,
      visitorId,
      credentials,
    });

    // Claim Locker if It's not claimed yet
    // if (!droppedAsset?.dataObject?.profileId) {
    //   await claimLocker({ droppedAsset, visitor, credentials });
    // }

    let s3Url = await generateS3Url(imageInfo, visitor);

    // Uncomment below to test locally, because we don't have an S3 bucket in localhost
    // let s3Url =
    //   "https://sdk-locker.s3.amazonaws.com/C0iRvAs9P3XHIApmtEFu-1706040195259.png";
    await updateDroppedAsset({
      droppedAsset,
      s3Url,
      visitor,
      imageInfo,
      credentials,
      profileId,
      assetId,
      world,
    });

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

async function updateDroppedAsset({
  droppedAsset,
  s3Url,
  visitor,
  imageInfo,
  credentials,
  profileId,
  assetId,
  world,
}) {
  await world.updateDataObject({
    lockers: {
      ...world.dataObject.lockers,
      [profileId]: { droppedAssetId: assetId, s3Url },
    },
  });

  await droppedAsset.updateWebImageLayers("", s3Url);

  const modifiedName = visitor.username.replace(/ /g, "%20");
  const imageInfoParam = generateImageInfoParam(imageInfo);
  const clickableLink = `${BASE_URL}/locker/spawned?${imageInfoParam}&visitor-name=${modifiedName}&profileId=${profileId}`;

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
