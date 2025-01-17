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
  getCredentials,
  isDroppedAssetClaimed,
  validateImageInfo,
} from "../utils/index.js";
import { WorldDataObject } from "../types/WorldDataObject.js";
import { DroppedAssetInterface } from "@rtsdk/topia";

export const handleEditDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, username, visitorId } = credentials;

    const { imageInfo, requiredTopLayerCategories, requiredBottomLayerCategories } = req.body;
    const { topLayerInfo, bottomLayerInfo } = imageInfo;

    const host = req.hostname;
    const baseUrl = getBaseUrl(host);

    if (requiredTopLayerCategories?.length > 0)
      validateImageInfo(topLayerInfo || imageInfo, requiredTopLayerCategories);
    if (bottomLayerInfo && requiredBottomLayerCategories?.length > 0)
      validateImageInfo(bottomLayerInfo, requiredBottomLayerCategories);

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    if (isDroppedAssetClaimed({ assetId, dataObject, profileId, themeName })) {
      return res.json({ isAssetAlreadyTaken: true });
    }

    const droppedAsset: DroppedAssetInterface = await DroppedAsset.get(assetId, urlSlug, { credentials });
    if (droppedAsset.topLayerURL) await deleteFromS3(host, droppedAsset.topLayerURL);
    if (droppedAsset.bottomLayerURL) await deleteFromS3(host, droppedAsset.bottomLayerURL);

    const topLayerS3Url = await generateS3Url(topLayerInfo || imageInfo, profileId, themeName, host);
    console.log("🚀 ~ file: handleEditDroppedAsset.ts:47 ~ topLayerS3Url:", topLayerS3Url);
    const bottomLayerS3Url =
      bottomLayerInfo.length > 0 ? await generateS3Url(bottomLayerInfo, profileId, themeName, host) : "";
    console.log("🚀 ~ file: handleEditDroppedAsset.ts:49 ~ bottomLayerS3Url:", bottomLayerS3Url);
    const s3Url =
      bottomLayerInfo.length > 0
        ? await generateS3Url({ ...bottomLayerInfo, ...topLayerInfo }, profileId, themeName, host)
        : topLayerS3Url;
    console.log("🚀 ~ file: handleEditDroppedAsset.ts:51 ~ s3Url:", s3Url);

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
    ]);

    world.triggerParticle({
      name: "blueSmoke_puff",
      duration: 3,
      position: {
        x: droppedAsset?.position?.x,
        y: droppedAsset?.position?.y,
      },
    });

    const visitor = await Visitor.create(visitorId, urlSlug, { credentials });
    visitor.fireToast({
      groupId: themeName,
      title: "✅ Success",
      text: `The ${themeName} has been decorated. Your changes have been saved!`,
    });

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
