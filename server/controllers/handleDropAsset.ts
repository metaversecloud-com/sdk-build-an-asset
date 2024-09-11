import { Request, Response } from "express";
import { dropImageAsset, errorHandler, generateS3Url, getCredentials, Visitor, World } from "../utils/index.js";
import { DroppedAssetInterface, VisitorInterface } from "@rtsdk/topia";
import { deleteFromS3 } from "../utils/images/deleteFromS3";

export const handleDropAsset = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    const { imageInfo } = req.body;

    if (!imageInfo) throw "Input data missing. Please provide the imageInfo in the request body.";

    const world = await World.create(urlSlug, { credentials });

    const s3Url = await generateS3Url(imageInfo, profileId, themeName, req.hostname);

    // calculate image name
    const parts = ["body", "arms", "head", "accessories"];
    const imageName = parts
      .map((part) => {
        const item = imageInfo[part.charAt(0).toUpperCase() + part.slice(1)]?.[0];
        return item ? item.imageName : `${part}_1`;
      })
      .join("_");
    const completeImageName = `${imageName}.png`;

    // get drop position
    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    const { moveTo } = visitor as VisitorInterface;
    const position = {
      x: (moveTo?.x || 0) + 60,
      y: moveTo?.y || 0,
    };

    // remove all user assets
    const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `${themeName}System-${profileId}`,
    });

    if (droppedAssets && droppedAssets.length > 0) {
      await Promise.all(
        droppedAssets.map((droppedAsset) => {
          droppedAsset.deleteDroppedAsset();
          // @ts-ignore
          deleteFromS3(req.hostname, droppedAsset.topLayerURL);
        }),
      );
    }

    // drop new asset
    const droppedAsset = await dropImageAsset({
      completeImageName,
      credentials,
      host: req.hostname,
      imageInfo,
      s3Url,
      position,
    });

    world.updateDataObject(
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

    return res.json({
      droppedAsset,
    });
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
