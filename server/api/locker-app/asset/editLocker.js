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

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
      visitor.fetchVisitor(),
    ]);

    let s3Url;

    const host = req.host;
    if (host === "localhost") {
      // Mock image placeholder for localhost, since we don't have S3 Bucket permissions for localhost in AWS
      s3Url =
        "https://sdk-locker.s3.amazonaws.com/C0iRvAs9P3XHIApmtEFu-1706040195259.png";
    } else {
      s3Url = await generateS3Url(imageInfo, visitor);
    }

    await updateDroppedAsset({
      droppedAsset,
      s3Url,
      visitor,
      imageInfo,
      credentials,
      profileId,
      assetId,
      world,
      baseUrl,
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
  baseUrl,
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
  const clickableLink = `${baseUrl}/locker/spawned?${imageInfoParam}&visitor-name=${modifiedName}&profileId=${profileId}`;

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
  });
}
