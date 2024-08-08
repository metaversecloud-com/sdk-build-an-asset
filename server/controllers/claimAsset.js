import { getBaseUrl } from "./requestHandlers.js";
import { DroppedAsset, World } from "../utils/topiaInit.js";
import { addNewRowToGoogleSheets } from "../utils/addNewRowToGoogleSheets.js";
import { logger } from "../logs/logger.js";
import { capitalize } from "../utils/captalize.js";

export const claimAsset = async (req, res) => {
  try {
    const { baseUrl, defaultUrlForImageHosting } = getBaseUrl(req);

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

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();

    // Check if this asset is taken
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
          msg: `This ${themeData} is already taken`,
          isAssetAlreadyTaken: true,
        });
      }
    }

    const s3Url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${themeName}/lockerBase_0.png`;

    try {
      await world.updateDataObject(
        {
          [`${themeName}.${profileId}`]: { droppedAssetId: assetId, s3Url },
        },
        {
          analytics: [
            {
              analyticName: `${themeName}-builds`,
              uniqueKey: profileId,
              profileId,
              urlSlug,
            },
          ],
          lock: {
            lockId: `${assetId}-${new Date(
              Math.round(new Date().getTime() / 10000) * 10000
            )}`,
          },
        }
      );

      addNewRowToGoogleSheets({
        identityId: req?.query?.identityId,
        displayName: req?.query?.displayName,
        appName: "Build an Asset",
        event: `${themeName}-starts`,
        urlSlug,
      })
        .then()
        .catch((error) => console.error(JSON.stringify(error)));
    } catch (error) {
      return res.json({
        msg: `This ${themeName} is already taken`,
        isAssetAlreadyTaken: true,
      });
    }

    const modifiedName = username.replace(/ /g, "%20");

    if (!modifiedName || !profileId) {
      return res.status(400).json({ error: "modifiedName or profileId" });
    }

    const clickableLink = `${baseUrl}/${themeName}/claimed?visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

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

    world
      .triggerParticle({
        name: "firework2_magenta",
        duration: 3,
        position: {
          x: droppedAsset?.position?.x,
          y: droppedAsset?.position?.y,
        },
      })
      .then()
      .catch((error) => {});

    return res.json({
      success: true,
      spawnedAsset: droppedAsset,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while claming the asset",
      functionName: "claimAsset",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};
