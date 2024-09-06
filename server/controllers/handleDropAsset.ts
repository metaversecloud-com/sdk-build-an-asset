import { Request, Response } from "express";
import { dropImageAsset, DroppedAsset, errorHandler, generateS3Url, getCredentials, World } from "../utils/index.js";

export const handleDropAsset = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug } = credentials;

    const { imageInfo } = req.body;

    if (!imageInfo) throw "Input data missing. Please provide the imageInfo in the request body.";

    const world = await World.create(urlSlug, { credentials });

    let s3Url;
    if (req.hostname === "localhost") {
      s3Url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${themeName}/claimedAsset.png`;
    } else {
      s3Url = await generateS3Url(imageInfo, profileId, themeName);
    }

    // calculate image name
    const parts = ["body", "arms", "head", "accessories"];
    const imageName = parts
      .map((part) => {
        const item = imageInfo[part.charAt(0).toUpperCase() + part.slice(1)]?.[0];
        return item ? item.imageName : `${part}_1`;
      })
      .join("_");
    const completeImageName = `${imageName}.png`;

    // get new drop position
    const background = await DroppedAsset.getWithUniqueName(
      `${themeName}-background`,
      urlSlug,
      process.env.INTERACTIVE_SECRET!,
      credentials,
    );
    const randomX = Math.floor(Math.random() * 1201) - 600;
    const randomY = -(Math.floor(Math.random() * 1301) - 750);
    const spawnPosition = {
      x: background?.position?.x || 0 + randomX,
      y: background?.position?.y || 0 + randomY,
    };

    // remove all user assets
    try {
      const spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
        uniqueName: `${themeName}System-${profileId}`,
      });

      if (spawnedAssets && spawnedAssets.length > 0) {
        await Promise.all(spawnedAssets.map((spawnedAsset) => spawnedAsset.deleteDroppedAsset()));
      }
    } catch (error) {
      console.error("❌ There are no assets to be deleted.", JSON.stringify(error));
    }

    // drop new asset
    const spawnedAsset = await dropImageAsset({
      completeImageName,
      credentials,
      host: req.hostname,
      imageInfo,
      s3Url,
      spawnPosition,
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
      spawnSuccess: true,
      success: true,
      isAssetSpawnedInWorld: true,
      completeImageName,
      spawnedAsset,
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
