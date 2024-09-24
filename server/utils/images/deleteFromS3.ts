import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const deleteFromS3 = async (host: string, fileName: string) => {
  try {
    const pathToImage = new URL(fileName).pathname;
    if (host === "localhost" || !fileName || !pathToImage.includes("userUploads")) return;
    const client = new S3Client({ region: "us-east-1" });

    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: pathToImage,
    });

    await client.send(deleteObjectCommand);
  } catch {
    (error: any) => console.error(error);
  }
};
