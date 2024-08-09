import { getBaseUrl, validateImageInfo } from "./requestHandlers.js";
import { generateS3Url, generateImageInfoParam } from "./imageUtils.js";
import { DroppedAsset, World, Visitor } from "../utils/topiaInit.js";
import { logger } from "../logs/logger.js";

export const editAsset = async (req, res) => {
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

    if (!validateImageInfo({ imageInfo, themeName, res })) return;

    const visitor = Visitor.create(visitorId, urlSlug, credentials);
    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    if (world.dataObject?.[themeName]) {
      const claimedAssets = Object.entries(
        world.dataObject?.[themeName]
      ).reduce((claimedAssets, [ownerProfileId, asset]) => {
        if (
          asset &&
          asset.droppedAssetId === assetId &&
          ownerProfileId !== profileId
        ) {
          return asset;
        }
        return claimedAssets;
      }, {});

      if (Object.keys(claimedAssets).length) {
        return res.json({
          msg: `This ${themeName} is already taken`,
          isAssetAlreadyTaken: true,
        });
      }
    }

    let s3Url;

    const host = req.host;
    if (host === "localhost") {
      // Mock image placeholder for localhost, since we don't have S3 Bucket permissions for localhost in AWS
      // await generateS3Url(imageInfo, profileId, themeName);
      s3Url =
        "https://sdk-locker.s3.amazonaws.com/C0iRvAs9P3XHIApmtEFu-1706040195259.png";
    } else {
      s3Url = await generateS3Url(imageInfo, profileId, themeName);
    }

    try {
      await world.updateDataObject(
        {
          [`${themeName}.${profileId}`]: { droppedAssetId: assetId, s3Url },
        },
        {
          lock: {
            lockId: `${assetId}-${new Date(
              Math.round(new Date().getTime() / 10000) * 10000
            )}`,
          },
          analytics: [
            {
              analyticName: `${themeName}-updates`,
              profileId,
              uniqueKey: profileId,
            },
          ],
        }
      );
    } catch (error) {
      console.error(`Error while updating the ${themeName}`, error);
      return res.json({
        msg: `This ${themeName} is already taken`,
      });
    }

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(imageInfo);

    if (!imageInfoParam || !modifiedName || !profileId) {
      return res
        .status(400)
        .json({ error: "Missing imageInfoParam, modifiedName or profileId" });
    }

    const clickableLink = `${baseUrl}/${themeName}/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

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
        clickableLinkTitle: themeName,
        clickableDisplayTextDescription: themeName,
        clickableDisplayTextHeadline: themeName,
        isOpenLinkInDrawer: true,
      }),
    ]);

    await world
      .triggerParticle({
        name: "Bubbles",
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
        groupId: themeName,
        title: "✅ Success",
        text: `The ${themeName} has been decorated. Your changes have been saved!`,
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
      message: "❌ Error while editing the asset",
      functionName: "editAsset",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};
