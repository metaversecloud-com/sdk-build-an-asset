import { ImageInfo } from "../../types/index.js";

export function generateImageInfoParam(imageInfo: ImageInfo) {
  const params: string[] = [];
  let counters: { [categoryKey: string]: number } = {};

  for (const category in imageInfo) {
    const categoryKey = category.replace(/ /g, "");

    imageInfo[category].forEach((item: { imageName: string }) => {
      counters[categoryKey] = (counters[categoryKey] || 0) + 1;
      params.push(`${categoryKey}${counters[categoryKey]}=${item.imageName}`);
    });
  }
  return params.join("&");
}
