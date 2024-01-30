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

export function validateImageInfo(imageInfo, res) {
  if (!imageInfo) {
    res.status(400).json({
      msg: "Input data missing. Please fill the the follow field: imageInfo",
    });
    return false;
  }
  return true;
}
