import { logger } from "../../../logs/logger.js";

export function getBaseUrl(req) {
  const protocol = process.env.INSTANCE_PROTOCOL;
  const host = req.host;
  let baseUrl;
  let defaultUrlForImageHosting;

  if (host === "localhost") {
    baseUrl = `http://localhost:3001`;
    defaultUrlForImageHosting = "https://locker0-dev-topia.topia-rtsdk.com";
  } else {
    baseUrl = `${protocol}://${host}`;
    defaultUrlForImageHosting = baseUrl;
  }

  return { baseUrl, defaultUrlForImageHosting };
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
