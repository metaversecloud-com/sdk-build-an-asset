import { ImageInfo } from "../../types/index.js";
import { errorHandler } from "../errorHandler.js";

export const validateImageInfo = (imageInfo: ImageInfo, requiredCategories: string[]) => {
  try {
    if (!imageInfo) throw "Input data missing. Please fill in the follow field: imageInfo";

    const hasAllRequiredFields = requiredCategories.every(
      (field) => imageInfo.hasOwnProperty(field) && Array.isArray(imageInfo[field]),
    );

    if (!hasAllRequiredFields) throw "Invalid data. Missing required fields or fields are not arrays.";

    return true;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "validateImageInfo",
      message: "Error validating image info",
    });
  }
};
