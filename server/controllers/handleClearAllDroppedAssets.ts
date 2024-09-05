import { Request, Response } from "express";
import { Visitor, World, errorHandler, getBaseUrl, getCredentials } from "../utils/index.js";
import { getS3URL } from "../utils/images/getS3URL.js";

export const handleClearAllDroppedAssets = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, themeName, urlSlug, visitorId } = credentials;

    const { baseUrl } = getBaseUrl(req.hostname);

    const world = await World.create(urlSlug, { credentials });

    let spawnedAssets = await world.fetchDroppedAssetsWithUniqueName({
      uniqueName: `${themeName}System-0`,
    });

    const toplayer = `${getS3URL()}/${themeName}/unclaimedAsset.png`;

    const clickableLink = `${baseUrl}/${themeName}`;
    const promises = [];
    spawnedAssets.map(async (asset) => {
      promises.push(asset.updateWebImageLayers("", toplayer));
      promises.push(
        asset.updateClickType({
          // @ts-ignore
          clickType: "link",
          clickableLink,
          clickableLinkTitle: themeName,
          clickableDisplayTextDescription: themeName,
          clickableDisplayTextHeadline: themeName,
          isOpenLinkInDrawer: true,
        }),
      );
    });

    promises.push(
      world.updateDataObject({ [themeName]: {} }, { analytics: [{ analyticName: `${themeName}-resets` }] }),
    );

    const visitor = await Visitor.create(visitorId, urlSlug, {
      credentials,
    });
    promises.push(visitor.reloadIframe(assetId));

    await Promise.allSettled(promises);

    return res.json({
      success: true,
      world,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleClearAllDroppedAssets",
      message: "Error clearing all dropped assets",
      req,
      res,
    });
  }
};
