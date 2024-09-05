import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials } from "../../utils/index.js";

export const handleGetDroppedAsset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const droppedAsset = await DroppedAsset.get(credentials.assetId, credentials.urlSlug, { credentials });

    return res.json({ droppedAsset, success: true });
  } catch (error) {
    errorHandler({
      error,
      functionName: "getDroppedAssetDetails",
      message: "Error getting dropped asset instance and data object",
      req,
      res,
    });
  }
};
