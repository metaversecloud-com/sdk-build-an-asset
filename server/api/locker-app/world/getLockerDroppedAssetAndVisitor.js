import { Visitor, DroppedAsset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

export const getLockerDroppedAssetAndVisitor = async (req, res) => {
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

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    await world.fetchDataObject();
    await visitor.fetchVisitor();

    if (!world.dataObject.lockers) {
      world.setDataObject({ lockers: [] });
    }

    // await Promise.all([
    //   droppedAsset.fetchDroppedAssetById(),
    //   droppedAsset.fetchDataObject(),
    //   visitor.fetchVisitor(),
    //   visitor.fetchDataObject(),
    // ]);

    // const userLocker = DroppedAsset.create(
    //   visitor.dataObject.droppedAssetId,
    //   urlSlug,
    //   { credentials }
    // );

    // await Promise.all([
    //   userLocker.fetchDroppedAssetById(),
    //   userLocker.fetchDataObject(),
    // ]);

    return res.json({
      world,
      visitor,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error getting droppedAsset and Visitor",
      functionName: "getDroppedAssetAndVisitor",
      req,
    });
    return res.status(500).send({ error, success: false });
  }
};

// function hotfixMessedUpLockersThatHaveNoOwnersInVisitorDataObject() {}
