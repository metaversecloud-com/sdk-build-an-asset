import { getBaseUrl, validateImageInfo } from "./requestHandlers.js";
import { generateS3Url, generateImageInfoParam } from "./imageUtils.js";
import { DroppedAsset, World, Visitor } from "../utils/topiaInit.js";
import { logger } from "../logs/logger.js";

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
      themeName,
    } = req.query;

    let { imageInfo } = req.body;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    if (!validateImageInfo(imageInfo, res)) return;

    const visitor = Visitor.create(visitorId, urlSlug, credentials);
    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    if (world.dataObject.lockers) {
      const claimedLockers = Object.entries(world.dataObject.lockers).reduce(
        (claimedLockers, [ownerProfileId, locker]) => {
          if (
            locker &&
            locker.droppedAssetId === assetId &&
            ownerProfileId !== profileId
          ) {
            return locker;
          }
          return claimedLockers;
        },
        {}
      );

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
      await generateS3Url(imageInfo, profileId, themeName);
      s3Url =
        "https://sdk-locker.s3.amazonaws.com/C0iRvAs9P3XHIApmtEFu-1706040195259.png";
    } else {
      s3Url = await generateS3Url(imageInfo, profileId, themeName);
    }

    try {
      await world.updateDataObject(
        {
          [`lockers.${profileId}`]: { droppedAssetId: assetId, s3Url },
        },
        {
          lock: {
            lockId: `${assetId}-${new Date(
              Math.round(new Date().getTime() / 10000) * 10000
            )}`,
          },
          analytics: [
            { analyticName: `locker-updates`, profileId, uniqueKey: profileId },
          ],
        }
      );
    } catch (error) {
      console.error("Error while updating the locker", error);
      return res.json({
        msg: "This locker is already taken",
      });
    }

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(imageInfo);

    if (!imageInfoParam || !modifiedName || !profileId) {
      return res
        .status(400)
        .json({ error: "Missing imageInfoParam, modifiedName or profileId" });
    }

    const clickableLink = `${baseUrl}/locker/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    // TODO: remove need for update clickType
    await Promise.all([
      droppedAsset.fetchDroppedAssetById(assetId),
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

    await world
      .triggerParticle({
        name: process.env.PARTICLE_EFFECT_NAME_FOR_EDIT_LOCKER || "Bubbles",
        duration: 3,
        position: {
          x: droppedAsset?.position?.x,
          y: droppedAsset?.position?.y,
        },
      })
      .then()
      .catch((error) => {});

    visitor
      .fireToast({
        groupId: "lockerApp",
        title: "✅ Success",
        text: "The locker has been decorated. Your changes have been saved!",
      })
      .then()
      .catch((error) => console.error(JSON.stringify(error)));

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
