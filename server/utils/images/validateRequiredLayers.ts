import { THEMES } from "../../constants.js";
import { ImageInfo } from "../../types/index.js";

const hasCategories = (layerInfo: ImageInfo | undefined, categories: string[]) =>
  categories.every((category) => {
    const items = layerInfo?.[category];
    return Array.isArray(items) && items.some((item) => item?.imageName);
  });

/**
 * Throws a 400 when a required category has no selection. Required categories come from the
 * server's theme config; client-sent lists are only used for themes the server doesn't know.
 */
export const validateRequiredLayers = ({
  imageInfo,
  requiredBottomLayerCategories,
  requiredTopLayerCategories,
  themeName,
}: {
  imageInfo: { topLayerInfo?: ImageInfo; bottomLayerInfo?: ImageInfo } & ImageInfo;
  requiredBottomLayerCategories?: string[];
  requiredTopLayerCategories?: string[];
  themeName: string;
}) => {
  if (!imageInfo) throw { status: 400, message: "Input data missing. Please provide the imageInfo in the request body." };

  const theme = THEMES[themeName];
  const requiredTop = theme?.requiredTopLayerCategories ?? requiredTopLayerCategories ?? [];
  const requiredBottom = theme?.requiredBottomLayerCategories ?? requiredBottomLayerCategories ?? [];

  // Older clients send a flat imageInfo instead of { topLayerInfo, bottomLayerInfo }
  const topLayerInfo = (imageInfo.topLayerInfo || imageInfo) as ImageInfo;
  const bottomLayerInfo = imageInfo.bottomLayerInfo;

  if (!hasCategories(topLayerInfo, requiredTop) || !hasCategories(bottomLayerInfo, requiredBottom)) {
    throw {
      status: 400,
      message: `Missing required parts. Required: ${[...requiredTop, ...requiredBottom].join(", ")}`,
    };
  }
};
