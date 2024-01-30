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

    if(world.dataObject.lockers) {
      const claimedLockers = Object.entries(world.dataObject.lockers).reduce((claimedLockers, [ownerProfileId, locker]) => {
        if (locker && locker.droppedAssetId === assetId && ownerProfileId !== profileId) {
          return locker
        }
        return claimedLockers;
      }, {})
      
      if (Object.keys(claimedLockers).length) {
        return res.json({
          msg: "This locker is already taken",
          isLockerAlreadyTaken: true,
        });
      }
    }

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

  await world.updateDataObject(
    {
      [`lockers.${profileId}`]: { droppedAssetId: assetId, s3Url },
    },
    {
      lock: {
        lockId: `${assetId}-${new Date(
          Math.round(new Date().getTime() / 10000) * 10000
        )}`,
        releaseLock: true,
      },
    }
  );

  // TODO: remove need for update clickType
  return await Promise.all([
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
