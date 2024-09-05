import { Request, Response } from "express";
import { Visitor, World, errorHandler, getCredentials } from "../utils/index.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handlePickupAllDroppedAssets = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, {
      credentials,
    });

    if (!visitor.isAdmin) throw "Only admins have enough permissions to pick up all assets";

    const world = await World.create(urlSlug, { credentials });

    const droppedAssets = await world.fetchDroppedAssetsWithUniqueName({
      isPartial: true,
      uniqueName: `${themeName}System-`,
    });

    if (Object.keys(droppedAssets).length > 0) {
      const droppedAssetIds: string[] = [];
      for (const index in droppedAssets) {
        if (droppedAssets[index].id) droppedAssetIds.push(droppedAssets[index].id);
      }
      await World.deleteDroppedAssets(
        credentials.urlSlug,
        droppedAssetIds,
        process.env.INTERACTIVE_SECRET!,
        credentials,
      );
    }

    await world
      .updateDataObject(
        {},
        {
          analytics: [
            {
              analyticName: `${themeName}-pickupAllAssets`,
              uniqueKey: profileId,
              profileId,
            },
          ],
        },
      )
      .then()
      .catch((error) => console.error(JSON.stringify(error)));

    return res.json({ success: true, world });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handlePickupAllDroppedAssets",
      message: "Error picking up all dropped assets",
      req,
      res,
    });
  }
};
