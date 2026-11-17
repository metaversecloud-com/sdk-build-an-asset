import { Request, Response } from "express";
import { Visitor, errorHandler, getCredentials, getKeyAssetDataObject } from "../utils/index.js";
import { VisitorInterface } from "@rtsdk/topia";

export const handleGetWorldAndVisitor = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, themeName, urlSlug, visitorId } = credentials;

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    const { isAdmin } = visitor as VisitorInterface;

    // initializes the theme's data (and copies it from the world the first time a key asset is used)
    const { dataObject } = await getKeyAssetDataObject(credentials);

    visitor
      .updatePublicKeyAnalytics([
        {
          analyticName: `${themeName}-starts`,
          uniqueKey: profileId,
          profileId,
          urlSlug,
        },
      ])
      .catch((error: any) =>
        errorHandler({
          error,
          functionName: "handleGetWorldAndVisitor",
          message: "Error updating public key analytics",
        }),
      );

    return res.json({ visitorIsAdmin: isAdmin, worldDataObject: dataObject });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetWorldAndVisitor",
      message: "Error getting world and visitor",
      req,
      res,
    });
  }
};
