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
  getCredentials,
  Visitor,
  World,
} from "../utils/index.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleDropAsset = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { displayName, identityId, interactivePublicKey, profileId, themeName, urlSlug, username, visitorId } =
      credentials;

    const { imageInfo } = req.body;

    if (!imageInfo) throw "Input data missing. Please provide the imageInfo in the request body.";

    const world = await World.create(urlSlug, { credentials });

    const s3Url = await generateS3Url(imageInfo, profileId, themeName, req.hostname);

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
    const asset = await Asset.create(process.env.IMG_ASSET_ID || "webImageAsset", {
      credentials: { interactivePublicKey, profileId, urlSlug },
    });

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(imageInfo);

    if (!imageInfoParam || !modifiedName || !profileId) {
      throw "Missing imageInfoParam, modifiedName or profileId";
    }

    const baseUrl = getBaseUrl(req.hostname);

    const clickableLink = `${baseUrl}/${themeName}/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    const droppedAsset = await DroppedAsset.drop(asset, {
      clickType: "link",
      clickableLink,
      clickableLinkTitle: themeName,
      clickableDisplayTextDescription: themeName,
      clickableDisplayTextHeadline: themeName,
      isOpenLinkInDrawer: true,
      isInteractive: true,
      interactivePublicKey,
      layer1: s3Url,
      position,
      uniqueName: `${themeName}System-${profileId}`,
      urlSlug,
    });

    world.updateDataObject(
      {
        [`${themeName}.${profileId}`]: { droppedAssetId: droppedAsset.id, s3Url },
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
    );

    addNewRowToGoogleSheets([
      {
        appName: "Build an Asset",
        displayName,
        event: `${themeName}-starts`,
        identityId,
        urlSlug,
      },
    ]).catch((error) => console.error(JSON.stringify(error)));

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
