import { Request, Response } from "express";
import {
  Visitor,
  World,
  clearAllDroppedAssets,
  errorHandler,
  getCredentials,
  pickupAllDroppedAssets,
} from "../utils/index.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleClearAllDroppedAssets = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    const { shouldDelete } = req.body;

    const promises = [];

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    const { isAdmin } = visitor as VisitorInterface;
    if (!isAdmin) throw "Only admins have enough permissions to pick up all assets";

    const world = await World.create(urlSlug, { credentials });

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
      world.updateDataObject(
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

    await world.fetchDataObject();

    return res.json({ worldDataObject: world.dataObject });
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
