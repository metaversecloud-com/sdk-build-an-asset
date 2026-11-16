import { Request, Response } from "express";
import { MAX_DROPPED_ASSETS_OPTIONS, Visitor, World, errorHandler, getCredentials } from "../utils/index.js";
import { WorldDataObject } from "../types/index.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleUpdateSettings = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, themeName, urlSlug, visitorId } = credentials;

    const { maxDroppedAssets } = req.body;

    if (maxDroppedAssets !== null && !MAX_DROPPED_ASSETS_OPTIONS.includes(maxDroppedAssets)) {
      throw `Invalid maxDroppedAssets. Must be one of: ${MAX_DROPPED_ASSETS_OPTIONS.join(", ")} or null (unlimited)`;
    }

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    const { isAdmin } = visitor as VisitorInterface;
    if (!isAdmin) throw "Only admins have enough permissions to update settings";

    const world = World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    const themeSettings = { ...dataObject?.settings?.[themeName], maxDroppedAssets };

    await world.updateDataObject(
      dataObject?.settings ? { [`settings.${themeName}`]: themeSettings } : { settings: { [themeName]: themeSettings } },
      {
        analytics: [
          {
            analyticName: `${themeName}-settingsUpdates`,
            profileId,
            uniqueKey: profileId,
          },
        ],
      },
    );

    await world.fetchDataObject();

    return res.json({ worldDataObject: world.dataObject });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleUpdateSettings",
      message: "Error updating settings",
      req,
      res,
    });
  }
};
