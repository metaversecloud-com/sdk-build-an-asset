import { Visitor } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";

export const create = async (req, res) => {
  try {
    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
    } = req.query;

    const { assetType, name } = req.body;

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        assetId,
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

    await visitor.fetchDataObject();

    let locker;
    if (!visitor?.dataObject?.locker) {
      locker = {
        username: visitor?.username,
        profileId: visitor?.profileId,
        assetType,
        name,
      };
      await visitor.setDataObject({ locker });
    }

    return res.json({ asset: visitor?.dataObject?.asset, success: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🏗️ Error while creating the locker for the first time",
      functionName: "create",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};
