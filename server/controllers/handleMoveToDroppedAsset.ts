import { Request, Response } from "express";
import { DroppedAsset, Visitor, World, errorHandler, getCredentials } from "../utils/index.js";
import { WorldDataObject } from "../types/WorldDataObject.js";

export const handleMoveToDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, profileId, themeName, urlSlug, visitorId } = credentials;

    const { closeIframeAfterMove } = req.body;

    const world = await World.create(urlSlug, { credentials });
    await world.fetchDataObject();
    const dataObject = world.dataObject as WorldDataObject;

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });

    const userAsset = await DroppedAsset.get(dataObject[themeName][profileId]?.droppedAssetId, urlSlug, {
      credentials,
    });

    const { x, y } = userAsset.position || { x: 0, y: 0 };
    await visitor.moveVisitor({
      shouldTeleportVisitor: false,
      x,
      y,
    });

    if (closeIframeAfterMove) await visitor.closeIframe(assetId);

    return res.json({
      success: true,
    });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleMoveToDroppedAsset",
      message: "Error moving to dropped asset",
      req,
      res,
    });
  }
};
