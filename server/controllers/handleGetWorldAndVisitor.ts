import { Request, Response } from "express";
import { Visitor, World, errorHandler, getCredentials } from "../utils/index.js";
import { WorldDataObject } from "../types/WorldDataObject.js";

export const handleGetWorldAndVisitor = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, themeName, urlSlug, visitorId } = credentials;

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    const world = await World.create(urlSlug, { credentials });

    await world.fetchDataObject();

    const dataObject = world.dataObject as WorldDataObject;

    if (!dataObject || Object.keys(dataObject).length === 0) {
      await world.setDataObject({ [themeName]: {} });
    } else if (!dataObject[themeName]) {
      await world.updateDataObject({ [themeName]: {} });
    }

    visitor
      .updatePublicKeyAnalytics([
        {
          analyticName: `${themeName}-starts`,
          uniqueKey: profileId,
          profileId,
          urlSlug,
        },
      ])
      .then()
      .catch((error) => console.error(JSON.stringify(error)));

    return res.json({ world, visitor });
  } catch (error) {
    errorHandler({
      error,
      functionName: "handleGetWorldAndVisitor",
      message: "Error getting world and visitor",
      req,
      res,
    });
  }
};
