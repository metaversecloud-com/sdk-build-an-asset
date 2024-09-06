export const getS3URL = () => {
  return `https://${process.env.S3_BUCKET || "sdk-build-an-asset"}.s3.amazonaws.com`;
};
