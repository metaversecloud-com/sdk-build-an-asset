import { logger } from "../../../logs/logger.js";
import { getBaseUrl, validateImageInfo } from "./requestHandlers.js";
import { generateS3Url, generateImageInfoParam } from "./imageUtils.js";
import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";

export const editLocker = async (req, res) => {
  try {
    const { baseUrl } = getBaseUrl(req);

    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
      uniqueName,
      profileId,
      username,
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
    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    await world.fetchDataObject();

    let s3Url;

    const host = req.host;
    if (host === "localhost") {
      // Mock image placeholder for localhost, since we don't have S3 Bucket permissions for localhost in AWS
      s3Url =
        "https://sdk-locker.s3.amazonaws.com/C0iRvAs9P3XHIApmtEFu-1706040195259.png";
    } else {
      s3Url = await generateS3Url(imageInfo, profileId);
    }

    await updateDroppedAsset({
      droppedAsset,
      s3Url,
      imageInfo,
      profileId,
      assetId,
      world,
      baseUrl,
      profileId,
      username,
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
  imageInfo,
  profileId,
  assetId,
  world,
  baseUrl,
  username,
}) {
  const modifiedName = username.replace(/ /g, "%20");
  const imageInfoParam = generateImageInfoParam(imageInfo);
  const clickableLink = `${baseUrl}/locker/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

  // TODO: remove need for update clickType
  return await Promise.all([
    world.updateDataObject({
      lockers: {
        ...world.dataObject.lockers,
        [profileId]: { droppedAssetId: assetId, s3Url },
      },
    }),
    droppedAsset.updateWebImageLayers("", s3Url),
    droppedAsset.updateClickType({
      clickType: "link",
      clickableLink,
      clickableLinkTitle: "Locker",
      clickableDisplayTextDescription: "Locker",
      clickableDisplayTextHeadline: "Locker",
      isOpenLinkInDrawer: true,
    }),
  ]);
}
