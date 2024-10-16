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

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    // @ts-ignore
    await deleteFromS3(host, droppedAsset.topLayerURL);
    const s3Url = await generateS3Url(imageInfo, profileId, themeName, host);

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(imageInfo);

    if (!imageInfoParam || !modifiedName || !profileId) {
      return res.status(400).json({ error: "Missing imageInfoParam, modifiedName or profileId" });
    }

    const clickableLink = `${baseUrl}/${themeName}/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.updateWebImageLayers("", s3Url),
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
    errorHandler({
      error,
      functionName: "handleEditDroppedAsset",
      message: "Error editing dropped asset",
      req,
      res,
    });
  }
};
