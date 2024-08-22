import { Visitor, DroppedAsset, World } from "../../utils/topiaInit.js";
import { logger } from "../../logs/logger.js";

export const getWorld = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
      profileId,
      themeName,
    } = req.query;

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    const world = await World.create(urlSlug, { credentials });

    await world.fetchDataObject();

    if (Object.keys(world?.dataObject).length === 0) {
      await world.setDataObject({ [themeName]: {} });
    }

    if (world.dataObject && !world.dataObject?.[themeName]) {
      await world.updateDataObject({ [themeName]: {} });
    }

    visitor
      .updatePublicKeyAnalytics([
        {
          analytics: [
            {
              analyticName: `${themeName}-starts`,
              uniqueKey: profileId,
              profileId,
              urlSlug,
            },
          ],
        },
      ])
      .then()
      .catch((error) => console.error(JSON.stringify(error)));

    return res.json({
      world,
      visitor,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error getting getWorld",
      functionName: "getWorld",
      req,
    });
    return res.status(500).send({ error, success: false });
  }
};
