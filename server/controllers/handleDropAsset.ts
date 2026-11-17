import { Request, Response } from "express";
import {
  addNewRowToGoogleSheets,
  Asset,
  deleteFromS3,
  DroppedAsset,
  errorHandler,
  generateImageInfoParam,
  generateS3Url,
  getBaseUrl,
  getKeyAssetDataObject,
  getDroppedAssetsToEvict,
  getRequiredCredentials,
  validateRequiredLayers,
  Visitor,
  World,
} from "../utils/index.js";
import { DroppedAssetClickType, DroppedAssetInterface, VisitorInterface } from "@rtsdk/topia";

export const handleDropAsset = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getRequiredCredentials(req.query);
    const {
      displayName,
      identityId,
      interactivePublicKey,
      profileId,
      sceneDropId,
      themeName,
      urlSlug,
      username,
      visitorId,
    } = credentials;

    const { imageInfo, requiredTopLayerCategories, requiredBottomLayerCategories } = req.body;
    validateRequiredLayers({ imageInfo, requiredTopLayerCategories, requiredBottomLayerCategories, themeName });

    const { topLayerInfo } = imageInfo;

    const userUniqueName = `${themeName}System-${profileId}`;

    const [visitor, asset, { world, dataObjectEntity, dataObject }] = await Promise.all([
      Visitor.get(visitorId, urlSlug, { credentials }),
      Asset.create(process.env.IMG_ASSET_ID || "webImageAsset", { credentials }),
      getKeyAssetDataObject(credentials),
    ]);
    const maxDroppedAssets = dataObject?.settings?.[themeName]?.maxDroppedAssets;

    // get user's dropped assets, plus everyone else's for this theme when a max is set
    let droppedAssets: DroppedAssetInterface[] = [];
    let otherDroppedAssets: DroppedAssetInterface[] = [];
    if (maxDroppedAssets) {
      const themeDroppedAssets: DroppedAssetInterface[] = await world.fetchDroppedAssetsWithUniqueName({
        isPartial: true,
        uniqueName: `${themeName}System-`,
      });
      const userDroppedAssetId = dataObject?.[themeName]?.[profileId]?.droppedAssetId;
      for (const themeDroppedAsset of themeDroppedAssets) {
        const isUserAsset =
          (themeDroppedAsset as DroppedAssetInterface & { uniqueName?: string }).uniqueName === userUniqueName ||
          themeDroppedAsset.id === userDroppedAssetId;
        if (isUserAsset) droppedAssets.push(themeDroppedAsset);
        else otherDroppedAssets.push(themeDroppedAsset);
      }
    } else {
      droppedAssets = await world.fetchDroppedAssetsWithUniqueName({ uniqueName: userUniqueName });
    }

    // remove the oldest assets if the max would be exceeded by this drop
    const assetsToEvict = getDroppedAssetsToEvict({ dataObject, maxDroppedAssets, otherDroppedAssets, themeName });

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(topLayerInfo || imageInfo);

    if (!imageInfoParam || !modifiedName) throw "Missing imageInfoParam or modifiedName";

    const baseUrl = getBaseUrl(req.hostname);

    const clickableLink = `${baseUrl}/${themeName}/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    const s3Url = await generateS3Url(topLayerInfo || imageInfo, profileId, themeName, req.hostname);

    // get drop position
    const { moveTo } = visitor as VisitorInterface;
    const position = {
      x: (moveTo?.x || 0) + 60,
      y: moveTo?.y || 0,
    };

    // drop new asset
    const droppedAsset = await DroppedAsset.drop(asset, {
      clickType: DroppedAssetClickType.LINK,
      clickableLink,
      clickableLinkTitle: themeName,
      clickableDisplayTextDescription: themeName,
      clickableDisplayTextHeadline: themeName,
      isOpenLinkInDrawer: true,
      isInteractive: true,
      interactivePublicKey,
      layer1: s3Url,
      position,
      sceneDropId,
      uniqueName: userUniqueName,
      urlSlug,
    });

    if (assetsToEvict.length > 0) {
      World.deleteDroppedAssets(
        urlSlug,
        assetsToEvict.map(({ droppedAsset }) => droppedAsset.id!),
        process.env.INTERACTIVE_SECRET!,
        credentials,
      ).catch((error) =>
        errorHandler({
          error,
          functionName: "handleDropAsset",
          message: "Error deleting oldest dropped assets",
        }),
      );
      for (const { droppedAsset } of assetsToEvict) {
        if (droppedAsset.topLayerURL) deleteFromS3(req.hostname, droppedAsset.topLayerURL);
      }
    }

    // remove user's previously dropped assets
    if (droppedAssets && droppedAssets.length > 0) {
      await Promise.all(
        droppedAssets.map((droppedAsset) => {
          droppedAsset.deleteDroppedAsset().catch((error) =>
            errorHandler({
              error,
              functionName: "handleDropAsset",
              message: "Error deleting previous dropped asset",
            }),
          );
          if (droppedAsset.topLayerURL) deleteFromS3(req.hostname, droppedAsset.topLayerURL);
        }),
      );
    }

    await Promise.all([
      world
        .triggerParticle({
          name: "whiteStar_burst",
          duration: 3,
          position,
        })
        .catch((error) =>
          errorHandler({
            error,
            functionName: "handleDropAsset",
            message: "Error triggering particle effects",
          }),
        ),

      dataObjectEntity.updateDataObject(
        {
          [`${themeName}.${profileId}`]: { droppedAssetId: droppedAsset.id, s3Url, droppedAt: Date.now() },
          ...Object.fromEntries(
            assetsToEvict
              .filter(({ ownerProfileId }) => ownerProfileId)
              .map(({ ownerProfileId }) => [`${themeName}.${ownerProfileId}`, null]),
          ),
        },
        {
          lock: {
            lockId: `${droppedAsset.id}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`,
            releaseLock: true,
          },
          analytics: [
            {
              analyticName: `${themeName}-updates`,
              profileId,
              uniqueKey: profileId,
            },
            {
              analyticName: `${themeName}-builds`,
              profileId,
              uniqueKey: profileId,
            },
          ],
        },
      ),

      addNewRowToGoogleSheets([
        {
          appName: "Build an Asset",
          displayName,
          event: `${themeName}-starts`,
          identityId,
          urlSlug,
        },
      ]).catch((error) => console.error(JSON.stringify(error))),
    ]);

    return res.json({ droppedAsset });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleDropAsset",
      message: "Error dropping asset",
      req,
      res,
    });
  }
};
