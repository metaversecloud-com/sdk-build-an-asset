import { DroppedAsset, Visitor, Asset, World } from "../../topiaInit.js";
import { logger } from "../../../logs/logger.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import Jimp from "jimp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

let BASE_URL;

export const editLocker = async (req, res) => {
  try {
    const protocol = process.env.INSTANCE_PROTOCOL;
    const host = req.host;
    const port = req.port;

    if (host === "localhost") {
      BASE_URL = `http://localhost:3001`;
    } else {
      BASE_URL = `${protocol}://${host}`;
    }

    const {
      assetId,
      interactivePublicKey,
      interactiveNonce,
      urlSlug,
      visitorId,
      uniqueName,
    } = req.query;

    const { imageInfo } = req.body;

    if (!imageInfo) {
      return res.status(400).json({
        msg: "Input data missing. Please fill the the follow field: imageInfo",
      });
    }

    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      visitorId,
    };

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });

    const droppedAsset = DroppedAsset.create(assetId, urlSlug, {
      credentials,
    });

    await Promise.all([
      droppedAsset.fetchDroppedAssetById(),
      droppedAsset.fetchDataObject(),
      visitor.fetchVisitor(),
      visitor.fetchDataObject(),
    ]);

    const { username } = visitor;

    // S3 Integration
    const baseDir = path.resolve(__dirname, "../locker-assets");
    const mergedImageBuffer = await combineImages(imageInfo, baseDir);
    const s3Url = await uploadToS3(
      mergedImageBuffer,
      `${visitor?.profileId}.png`
    );

    await droppedAsset.setDataObject({ s3Url });

    // const { bottomLayer, toplayer } = getAssetImgUrl(req);
    await droppedAsset?.updateWebImageLayers("", s3Url);

    const imageInfoString = JSON.stringify(imageInfo);

    const modifiedName = username.replace(/ /g, "%20");

    const imageInfoParam = generateImageInfoParam(imageInfo);
    const clickableLink = `${BASE_URL}/locker/spawned?${imageInfoParam}&visitor-name=${modifiedName}`;

    await droppedAsset?.updateClickType({
      clickType: "link",
      clickableLink,
      clickableLinkTitle: "Locker",
      clickableDisplayTextDescription: "Locker",
      clickableDisplayTextHeadline: "Locker",
      isOpenLinkInDrawer: true,
    });

    await droppedAsset?.updateDataObject({
      profileId: visitor?.profileId,
      imageInfo,
      parentAssetId: credentials?.assetId,
    });

    return res.json({
      spawnSuccess: true,
      success: true,
      isAssetSpawnedInWorld: true,
      imageInfo,
      spawnedAsset: droppedAsset,
    });
  } catch (error) {
    logger.error({
      error,
      message: "❌ Error while spawning the asset",
      functionName: "spawn",
      req,
    });
    return res
      .status(500)
      .send({ error: error?.message, spawnSuccess: false, success: false });
  }
};

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

  // Criar uma nova imagem com as dimensões calculadas
  let mergedImage = new Jimp(maxWidth, maxHeight, 0x00000000);

  // Combinar todas as imagens
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

async function uploadToS3(buffer, fileName) {
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

function generateImageInfoParam(imageInfo) {
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
