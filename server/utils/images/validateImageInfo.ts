import { ImageInfo } from "../../types/index.js";
import { errorHandler } from "../errorHandler.js";

export const validateImageInfo = ({ imageInfo, themeName }: { imageInfo: ImageInfo; themeName: string }) => {
  try {
    if (!imageInfo) throw "Input data missing. Please fill in the follow field: imageInfo";

    let requiredFields: string[] = [];

    if (themeName === "locker") {
      requiredFields = ["Locker Base", "Top Shelf", "Bottom Shelf", "Door"];
    } else if (themeName === "desk") {
      requiredFields = ["Desk Base", "Accessories"];
    } else if (themeName === "snowman") {
      requiredFields = ["Body", "Head", "Accessories", "Arms"];
    } else if (themeName === "pumpkin") {
      requiredFields = ["Body", "Eyes", "Mouth"];
    }

    const hasAllRequiredFields = requiredFields.every(
      (field) => imageInfo.hasOwnProperty(field) && Array.isArray(imageInfo[field]),
    );

    if (!hasAllRequiredFields) throw "Invalid data. Missing required fields or fields are not arrays.";

    return true;
  } catch (error) {
    errorHandler({
      error,
      functionName: "validateImageInfo",
      message: "Error validating image info",
    });
    return false;
  }
};
