import Jimp from "jimp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageInfo } from "../../types/index.js";

const combineImages = async (imageInfo: ImageInfo, baseDir: string) => {
  let images = [];

  for (const category in imageInfo) {
    if (category.length === 0) return;
    for (const item of imageInfo[category]) {
      const image = await Jimp.read(`${baseDir}/${item.imageName}`);
      images.push(image);
    }
  }

  let maxWidth = 0;
  let maxHeight = 0;

  console.log("🚀 ~ file: generateS3URL.ts:20 ~ images.length:", images.length);
  if (images.length === 0) return;
  images.forEach((image) => {
    if (image.bitmap.width > maxWidth) maxWidth = image.bitmap.width;
    if (image.bitmap.height > maxHeight) maxHeight = image.bitmap.height;
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

const uploadToS3 = async (buffer: Buffer, fileName: string, themeName: string) => {
  const client = new S3Client({ region: "us-east-1" });

  const pathToImage = `${themeName}/userUploads/${fileName}`;
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: pathToImage,
    Body: buffer,
    ContentType: "image/png",
  });

  await client.send(putObjectCommand);

  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${pathToImage}`;
};

export const generateS3Url = async (imageInfo: ImageInfo, profileId: string, themeName: string, host: string) => {
  let baseDir = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${themeName}`;

  // Mock image placeholder for localhost, since we don't have S3 Bucket PUT permissions for localhost in AWS
  if (host === "localhost") return `${baseDir}/claimedAsset.png`;

  const mergedImageBuffer = await combineImages(imageInfo, baseDir);
  if (!mergedImageBuffer) throw new Error("Failed to generate merged image buffer.");

  const imageFullName = `${profileId}-${Date.now()}.png`;
  console.log("🚀 ~ file: generateS3URL.ts:68 ~ imageFullName:", imageFullName);
  return uploadToS3(mergedImageBuffer, imageFullName, themeName);
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
