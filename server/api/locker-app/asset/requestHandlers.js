import { logger } from "../../../logs/logger.js";

export function getBaseUrl(req) {
  const protocol = process.env.INSTANCE_PROTOCOL;
  const host = req.host;

  if (host === "localhost") {
    return `http://localhost:3001`;
  } else {
    return `${protocol}://${host}`;
  }
}

export function processRequestQuery(req) {
  const assetId = req.query.assetId;
  const interactivePublicKey = req.query.interactivePublicKey;
  const interactiveNonce = req.query.interactiveNonce;
  const urlSlug = req.query.urlSlug;
  const visitorId = req.query.visitorId;
  const uniqueName = req.query.uniqueName;
  const imageInfo = req.body.imageInfo;

  const credentials = {
    assetId,
    interactiveNonce,
    interactivePublicKey,
    visitorId,
  };

  return {
    assetId,
    interactivePublicKey,
    interactiveNonce,
    urlSlug,
    visitorId,
    uniqueName,
    imageInfo,
    credentials,
  };
}

export function validateImageInfo(imageInfo, res) {
  if (!imageInfo) {
    res.status(400).json({
      msg: "Input data missing. Please fill the the follow field: imageInfo",
    });
    return false;
  }
  return true;
}

export function handleError(error, res) {
  logger.error({
    error,
    message: "❌ Error while spawning the asset",
    functionName: "spawn",
    req,
  });
  res
    .status(500)
    .send({ error: error?.message, spawnSuccess: false, success: false });
}
