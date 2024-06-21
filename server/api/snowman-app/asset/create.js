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
      profileId,
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

    let asset;
    if (!visitor?.dataObject?.asset) {
      asset = {
        username: visitor?.username,
        experience: 0,
        assetType,
        name,
      };
      await visitor.setDataObject(
        { asset },
        {
          analytics: [
            {
              analyticName: `snowman-starts`,
              uniqueKey: profileId,
              urlSlug,
              profileId,
            },
          ],
        }
      );
    }

    return res.json({ asset: visitor?.dataObject?.asset, success: true });
  } catch (error) {
    logger.error({
      error,
      message: "❌ 🏗️ Error while creating the asset for the first time",
      functionName: "create",
      req,
    });
    return res.status(500).send({ error: error?.message, success: false });
  }
};
