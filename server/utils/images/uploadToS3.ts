import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToS3(buffer: Buffer, fileName: string) {
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
