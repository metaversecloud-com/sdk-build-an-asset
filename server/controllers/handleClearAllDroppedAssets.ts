import { Request, Response } from "express";
import {
  Visitor,
  clearAllDroppedAssets,
  errorHandler,
  getKeyAssetDataObject,
  getRequiredCredentials,
  pickupAllDroppedAssets,
} from "../utils/index.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleClearAllDroppedAssets = async (req: Request, res: Response) => {
  try {
    const credentials = getRequiredCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    const { shouldDelete } = req.body;

    const promises = [];

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    const { isAdmin } = visitor as VisitorInterface;
    if (!isAdmin) throw "Only admins have enough permissions to pick up all assets";

    const { world, dataObjectEntity } = await getKeyAssetDataObject(credentials);

    const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
      isPartial: true,
      uniqueName: `${themeName}System-`,
    });

    if (shouldDelete) {
      promises.push(pickupAllDroppedAssets({ credentials, droppedAssets }));
    } else {
      promises.push(clearAllDroppedAssets({ droppedAssets, hostname: req.hostname, themeName }));
    }

    promises.push(
      dataObjectEntity.updateDataObject(
        { [themeName]: {} },
        {
          analytics: [
            {
              analyticName: `${themeName}-${shouldDelete ? "pickupAllAssets" : "resets"}`,
              uniqueKey: profileId,
              profileId,
            },
          ],
        },
      ),
    );

    promises.push(
      visitor.closeIframe(assetId).catch((error: any) =>
        errorHandler({
          error,
          functionName: "handleClearAllDroppedAssets",
          message: "Error closing iframe",
        }),
      ),
    );

    await Promise.all(promises);

    await dataObjectEntity.fetchDataObject();

    return res.json({ worldDataObject: dataObjectEntity.dataObject });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleClearAllDroppedAssets",
      message: "Error clearing all dropped assets",
      req,
      res,
    });
  }
};
