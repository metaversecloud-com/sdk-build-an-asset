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

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials,
    });
    const { isAdmin } = visitor as VisitorInterface;
    if (!isAdmin) throw "Only admins have enough permissions to pick up all assets";

    const world = await World.create(urlSlug, { credentials });

    const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
      isPartial: shouldDelete,
      uniqueName: `${themeName}System-`,
    });

    if (shouldDelete) {
      pickupAllDroppedAssets({ credentials, droppedAssets });
    } else {
      clearAllDroppedAssets({ droppedAssets, hostname: req.hostname, themeName });
    }

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
    );

    visitor.closeIframe(assetId);

    return res.json({ success: true, worldDataObject: world.dataObject });
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
