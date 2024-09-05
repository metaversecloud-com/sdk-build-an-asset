import Jimp from "jimp";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToS3 } from "./index.js";
import { ImageInfo } from "../../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// todo: move imageInfo to types
const combineImages = async (imageInfo: ImageInfo, baseDir: string) => {
  let images = [];

  for (const category in imageInfo) {
    for (const item of imageInfo[category]) {
      const imagePath = path.join(baseDir, item.imageName + ".png");
      const image = await Jimp.read(imagePath);
      images.push(image);
    }
  }

  let maxWidth = 0;
  let maxHeight = 0;

  images.forEach((image) => {
    if (image.bitmap.width > maxWidth) {
      maxWidth = image.bitmap.width;
    }
    if (image.bitmap.height > maxHeight) {
      maxHeight = image.bitmap.height;
    }
  });

  let mergedImage = new Jimp(maxWidth, maxHeight, 0x00000000);

  images.forEach((image) => {
    mergedImage.composite(image, 0, 0, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1,
    });
  });

  const buffer = await mergedImage.getBufferAsync(Jimp.MIME_PNG);

  return validatePNG(buffer);
};

export const generateS3Url = async (imageInfo: { [category: string]: {} }, profileId: string, themeName: string) => {
  const baseDir = path.resolve(__dirname, `../images/${themeName}-assets`);
  const mergedImageBuffer = await combineImages(imageInfo, baseDir);
  const imageFullName = `${profileId}-${Date.now()}.png`;
  return uploadToS3(mergedImageBuffer, imageFullName);
};

function validatePNG(buffer: Buffer) {
  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Verify headers
  if (!buffer.slice(0, 8).equals(pngHeader)) {
    throw new Error("invalid headers. png file is corrupted.");
  }

  // Verify if it has dimensions
  return Jimp.read(buffer).then((image) => {
    if (image.bitmap.width <= 0 || image.bitmap.height <= 0) {
      throw new Error("Invalid png dimensions. Png file is corrupted.");
    }
    return buffer;
  });
}
