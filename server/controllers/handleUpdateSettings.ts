import { Request, Response } from "express";
import { MAX_DROPPED_ASSETS_OPTIONS, Visitor, errorHandler, getKeyAssetDataObject, getRequiredCredentials } from "../utils/index.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleUpdateSettings = async (req: Request, res: Response) => {
  try {
    const credentials = getRequiredCredentials(req.query);
    const { profileId, themeName, urlSlug, visitorId } = credentials;

    const { maxDroppedAssets } = req.body;

    if (maxDroppedAssets !== null && !MAX_DROPPED_ASSETS_OPTIONS.includes(maxDroppedAssets)) {
      throw `Invalid maxDroppedAssets. Must be one of: ${MAX_DROPPED_ASSETS_OPTIONS.join(", ")} or null (unlimited)`;
    }

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    const { isAdmin } = visitor as VisitorInterface;
    if (!isAdmin) throw "Only admins have enough permissions to update settings";

    const { dataObjectEntity, dataObject } = await getKeyAssetDataObject(credentials);

    const themeSettings = { ...dataObject?.settings?.[themeName], maxDroppedAssets };

    await dataObjectEntity.updateDataObject(
      dataObject?.settings ? { [`settings.${themeName}`]: themeSettings } : { settings: { [themeName]: themeSettings } },
      {
        analytics: [
          {
            analyticName: `${themeName}-settingsUpdates`,
            profileId,
            uniqueKey: profileId,
            urlSlug,
          },
        ],
      },
    );

    await dataObjectEntity.fetchDataObject();

    return res.json({ worldDataObject: dataObjectEntity.dataObject });
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
