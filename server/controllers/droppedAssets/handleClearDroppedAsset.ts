import { Request, Response } from "express";
import { DroppedAsset, Visitor, World, errorHandler, getBaseUrl, getCredentials } from "../../utils/index.js";
import { WorldDataObject } from "../../types/WorldDataObject.js";
import { getS3URL } from "../../utils/images/getS3URL.js";

export const handleClearDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    let { ownerProfileId } = req.query;

    const { isClearAssetFromUnclaimedAsset } = req.body;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    let selectedAssetId;

    if (isClearAssetFromUnclaimedAsset) {
      selectedAssetId = dataObject?.[themeName]?.[profileId]?.droppedAssetId;
      ownerProfileId = profileId;
    } else {
      selectedAssetId = assetId;
    }

    const { baseUrl } = getBaseUrl(req.hostname);

    const droppedAsset = DroppedAsset.create(selectedAssetId, urlSlug, {
      credentials,
    });

    const toplayer = `${getS3URL()}/${themeName}/unclaimedAsset.png`;

    const clickableLink = `${baseUrl}/${themeName}`;

    const visitor = await Visitor.create(visitorId, urlSlug, {
      credentials,
    });

    await Promise.all([
      droppedAsset?.updateWebImageLayers("", toplayer),
      droppedAsset?.updateClickType({
        // @ts-ignore
        clickType: "link",
        clickableLink,
        clickableLinkTitle: themeName,
        clickableDisplayTextDescription: themeName,
        clickableDisplayTextHeadline: themeName,
        isOpenLinkInDrawer: true,
      }),
      world.updateDataObject(
        {
          [`${themeName}.${ownerProfileId}`]: null,
        },
        {
          analytics: [
            {
              analyticName: `${themeName}-unclaims`,
              profileId,
              uniqueKey: profileId,
            },
          ],
        },
      ),
      visitor.reloadIframe(assetId),
    ]);

    return res.json({
      success: true,
      world,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleClearDroppedAsset",
      message: "Error clearing dropped asset",
      req,
      res,
    });
  }
};
