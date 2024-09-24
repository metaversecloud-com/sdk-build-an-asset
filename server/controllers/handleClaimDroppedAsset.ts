import { Request, Response } from "express";
import {
  DroppedAsset,
  World,
  errorHandler,
  getBaseUrl,
  getCredentials,
  isDroppedAssetClaimed,
} from "../utils/index.js";
import { WorldDataObject } from "../types/WorldDataObject.js";
import { addNewRowToGoogleSheets } from "../utils/addNewRowToGoogleSheets.js";

export const handleClaimDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, displayName, identityId, profileId, themeName, urlSlug, username } = credentials;

    const baseUrl = getBaseUrl(req.hostname);

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    // Check if this dropped asset is taken
    if (isDroppedAssetClaimed({ assetId, dataObject, profileId, themeName })) {
      return res.json({ isAssetAlreadyTaken: true });
    }

    const s3Url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${themeName}/claimedAsset.png`;

    const modifiedName = username.replace(/ /g, "%20");

    if (!modifiedName || !profileId) {
      throw "Missing  modifiedName or profileId";
    }

    const clickableLink = `${baseUrl}/${themeName}/claimed?visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.updateWebImageLayers("", s3Url),
      droppedAsset.updateClickType({ clickableLink, clickableLinkTitle: themeName }),
      world.updateDataObject(
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
            lockId: `${assetId}-${new Date(Math.round(new Date().getTime() / 10000) * 10000)}`,
          },
        },
      ),
      world.fetchDataObject(),
    ]);

    addNewRowToGoogleSheets([
      {
        appName: "Build an Asset",
        displayName,
        event: `${themeName}-starts`,
        identityId,
        urlSlug,
      },
    ])
      .then()
      .catch((error) => console.error(JSON.stringify(error)));

    world.triggerParticle({
      name: "whiteStar_burst",
      duration: 3,
      position: {
        x: droppedAsset?.position?.x,
        y: droppedAsset?.position?.y,
      },
    });

    return res.json({ droppedAsset, worldDataObject: world.dataObject });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleClaimDroppedAsset",
      message: "Error claiming dropped asset",
      req,
      res,
    });
  }
};
