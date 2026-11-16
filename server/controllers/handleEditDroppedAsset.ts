import { Request, Response } from "express";
import {
  DroppedAsset,
  Visitor,
  World,
  deleteFromS3,
  errorHandler,
  generateImageInfoParam,
  generateS3Url,
  getBaseUrl,
  getRequiredCredentials,
  isDroppedAssetClaimed,
  releaseClaimedAsset,
  validateRequiredLayers,
} from "../utils/index.js";
import { WorldDataObject } from "../types/WorldDataObject.js";
import { THEMES } from "../constants.js";
import { DroppedAssetInterface, VisitorInterface, WorldInterface } from "@rtsdk/topia";

export const handleEditDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getRequiredCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, username, visitorId } = credentials;

    const { imageInfo, requiredTopLayerCategories, requiredBottomLayerCategories } = req.body;
    validateRequiredLayers({ imageInfo, requiredTopLayerCategories, requiredBottomLayerCategories, themeName });

    const { topLayerInfo, bottomLayerInfo } = imageInfo || {};
    const hasBottomLayer = bottomLayerInfo && Object.keys(bottomLayerInfo).length > 0;

    const host = req.hostname;
    const baseUrl = getBaseUrl(host);

    const [world, visitor, droppedAsset]: [WorldInterface, VisitorInterface, DroppedAssetInterface] = await Promise.all(
      [
        World.create(urlSlug, { credentials }),
        Visitor.create(visitorId, urlSlug, { credentials }),
        DroppedAsset.get(assetId, urlSlug, { credentials }),
      ],
    );

    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    if (isDroppedAssetClaimed({ assetId, dataObject, profileId, themeName })) {
      return res.json({ isAssetAlreadyTaken: true });
    }

    // one per player: editing an unclaimed sign claims it, so release the player's previous sign
    const previousAssetId = dataObject?.[themeName]?.[profileId]?.droppedAssetId;
    if (!THEMES[themeName]?.shouldDropAsset && previousAssetId && previousAssetId !== assetId) {
      await releaseClaimedAsset({ credentials, droppedAssetId: previousAssetId, hostname: host }).catch((error) =>
        errorHandler({
          error,
          functionName: "handleEditDroppedAsset",
          message: "Error releasing previously claimed asset",
        }),
      );
    }

    if (droppedAsset.topLayerURL) await deleteFromS3(host, droppedAsset.topLayerURL);
    if (droppedAsset.bottomLayerURL) await deleteFromS3(host, droppedAsset.bottomLayerURL);

    const topLayerS3Url = await generateS3Url(topLayerInfo || imageInfo, profileId, themeName, host);
    const bottomLayerS3Url = hasBottomLayer ? await generateS3Url(bottomLayerInfo, profileId, themeName, host) : "";
    const s3Url = hasBottomLayer
      ? await generateS3Url({ ...bottomLayerInfo, ...topLayerInfo }, profileId, themeName, host)
      : topLayerS3Url;

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(topLayerInfo ? { ...topLayerInfo, ...bottomLayerInfo } : imageInfo);

    if (!imageInfoParam || !modifiedName || !profileId) {
      return res.status(400).json({ error: "Missing imageInfoParam, modifiedName or profileId" });
    }

    const clickableLink = `${baseUrl}/${themeName}/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    await Promise.all([
      droppedAsset.updateWebImageLayers(bottomLayerS3Url, topLayerS3Url),
      droppedAsset.updateClickType({ clickableLink, clickableLinkTitle: themeName }),
      world.updateDataObject(
        {
          [`${themeName}.${profileId}`]: { droppedAssetId: assetId, s3Url },
        },
        {
          lock: {
            lockId: `${assetId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`,
            releaseLock: true,
          },
          analytics: [
            {
              analyticName: `${themeName}-updates`,
              profileId,
              uniqueKey: profileId,
            },
          ],
        },
      ),
      world
        .triggerParticle({
          name: "firework1_gold",
          duration: 3,
          position: {
            x: droppedAsset?.position?.x,
            y: droppedAsset?.position?.y,
          },
        })
        .catch((error: any) =>
          errorHandler({
            error,
            functionName: "handleEditDroppedAsset",
            message: "Error triggering particle effects",
          }),
        ),

      visitor
        .fireToast({
          groupId: themeName,
          title: "✅ Success",
          text: `The ${themeName} has been decorated. Your changes have been saved!`,
        })
        .catch((error) =>
          errorHandler({
            error,
            functionName: "handleEditDroppedAsset",
            message: "Error firing toast",
          }),
        ),
    ]);

    await world.fetchDataObject();

    return res.json({
      imageInfo,
      droppedAsset,
      worldDataObject: world.dataObject,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleEditDroppedAsset",
      message: "Error editing dropped asset",
      req,
      res,
    });
  }
};
