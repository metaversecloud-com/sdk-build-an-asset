import { Visitor, DroppedAsset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

export const getWorld = async (req, res) => {
  try {
    const {
      visitorId,
      interactiveNonce,
      assetId,
      interactivePublicKey,
      urlSlug,
      profileId,
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

    if (!world.dataObject.lockers) world.setDataObject({ lockers: {} });

    world
      .updateDataObject(
        {},
        {
          analytics: [
            {
              analyticName: `locker-starts`,
              uniqueKey: profileId,
              profileId,
              urlSlug,
            },
          ],
        }
      )
      .then()
      .catch(console.error("Error sending the starts analytics"));

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
