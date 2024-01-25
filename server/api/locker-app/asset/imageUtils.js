import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import Jimp from "jimp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function combineImages(imageInfo, baseDir) {
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

  return buffer;
}

export async function uploadToS3(buffer, fileName) {
  const client = new S3Client({ region: "us-east-1" });

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: "image/png",
  });

  await client.send(putObjectCommand);

  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`;
}

export function generateImageInfoParam(imageInfo) {
  let params = [];
  let counters = {};

  for (const category in imageInfo) {
    const categoryKey = category.replace(/ /g, "");

    imageInfo[category].forEach((item) => {
      counters[categoryKey] = (counters[categoryKey] || 0) + 1;
      params.push(`${categoryKey}${counters[categoryKey]}=${item.imageName}`);
    });
  }
  return params.join("&");
}

export async function generateS3Url(imageInfo, visitor) {
  const baseDir = path.resolve(__dirname, "../locker-assets");
  const mergedImageBuffer = await combineImages(imageInfo, baseDir);
  const imageFullName = `${visitor.profileId}-${Date.now()}.png`;
  return uploadToS3(mergedImageBuffer, imageFullName);
}
