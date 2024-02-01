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

  const requiredFields = [
    "Locker Base",
    "Wallpaper",
    "Top Shelf",
    "Bottom Shelf",
    "Door",
  ];

  const hasAllRequiredFields = requiredFields.every(
    (field) =>
      imageInfo.hasOwnProperty(field) && Array.isArray(imageInfo[field])
  );

  if (!hasAllRequiredFields) {
    res.status(400).json({
      msg: "Invalid data. Missing required fields or fields are not arrays.",
    });
    return false;
  }

  const hasValidImageNames = requiredFields.every((field) =>
    imageInfo[field].every(
      (item) =>
        item.hasOwnProperty("imageName") && typeof item.imageName === "string"
    )
  );

  if (!hasValidImageNames) {
    res.status(400).json({
      msg: "Invalid data. Each item in the arrays must have a 'imageName' property of string type.",
    });
    return false;
  }

  return true;
}