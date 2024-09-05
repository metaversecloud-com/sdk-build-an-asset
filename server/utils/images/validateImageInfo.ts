import { ImageInfo } from "../../types/index.js";
import { errorHandler } from "../errorHandler.js";

export const validateImageInfo = ({ imageInfo, themeName }: { imageInfo: ImageInfo; themeName: string }) => {
  try {
    if (!imageInfo) throw "Input data missing. Please fill the the follow field: imageInfo";

    let requiredFields: string[] = [];

    if (themeName === "locker") {
      requiredFields = ["Locker Base", "Top Shelf", "Bottom Shelf", "Door"];
    } else if (themeName === "desk") {
      requiredFields = ["Desk Base", "Accessories"];
    } else if (themeName === "snowman") {
      requiredFields = ["Body", "Head", "Accessories", "Arms"];
    }

    const hasAllRequiredFields = requiredFields.every(
      (field) => imageInfo.hasOwnProperty(field) && Array.isArray(imageInfo[field]),
    );

    if (!hasAllRequiredFields) throw "Invalid data. Missing required fields or fields are not arrays.";

    const hasValidImageNames = requiredFields.every((field) =>
      imageInfo[field].every((item) => item.hasOwnProperty("imageName") && typeof item.imageName === "string"),
    );

    if (!hasValidImageNames)
      throw "Invalid data. Each item in the arrays must have a 'imageName' property of string type.";

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
