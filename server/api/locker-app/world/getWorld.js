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

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    const world = await World.create(urlSlug, { credentials });

    await world.fetchDataObject();
    await visitor.fetchVisitor();

    if (!world.dataObject.lockers) {
      world.setDataObject({ lockers: [] });
    }

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

// function hotfixMessedUpLockersThatHaveNoOwnersInVisitorDataObject() {}
