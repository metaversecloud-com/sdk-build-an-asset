import { Request, Response } from "express";
import {
  DroppedAsset,
  Visitor,
  World,
  errorHandler,
  generateImageInfoParam,
  generateS3Url,
  getBaseUrl,
  getCredentials,
  isDroppedAssetClaimed,
  validateImageInfo,
} from "../utils/index.js";
import { WorldDataObject } from "../types/WorldDataObject.js";

export const handleEditDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, username, visitorId } = credentials;

    const { imageInfo } = req.body;

    const host = req.hostname;
    const baseUrl = getBaseUrl(host);

    if (!validateImageInfo({ imageInfo, themeName })) return;

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    if (isDroppedAssetClaimed({ assetId, dataObject, profileId, themeName })) {
      return res.json({ isAssetAlreadyTaken: true });
    }

    const s3Url = await generateS3Url(imageInfo, profileId, themeName, host);

    try {
      await world.updateDataObject(
        {
          [`${themeName}.${profileId}`]: { droppedAssetId: assetId, s3Url },
        },
        {
          lock: {
            lockId: `${assetId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`,
          },
          analytics: [
            {
              analyticName: `${themeName}-updates`,
              profileId,
              uniqueKey: profileId,
            },
          ],
        },
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
      return res.status(400).json({ error: "Missing imageInfoParam, modifiedName or profileId" });
    }

    const clickableLink = `${baseUrl}/${themeName}/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });
    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.updateWebImageLayers("", s3Url),
      droppedAsset.updateClickType({ clickableLink, clickableLinkTitle: themeName }),
      world.fetchDataObject(),
    ]);

    world.triggerParticle({
      name: "Bubbles",
      duration: 3,
      position: {
        x: droppedAsset?.position?.x,
        y: droppedAsset?.position?.y,
      },
    });

    visitor.fireToast({
      groupId: themeName,
      title: "✅ Success",
      text: `The ${themeName} has been decorated. Your changes have been saved!`,
    });

    return res.json({
      success: true,
      imageInfo,
      droppedAsset,
      worldDataObject: world.dataObject,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleEditDroppedAsset",
      message: "Error editing dropped asset",
      req,
      res,
    });
  }
};
