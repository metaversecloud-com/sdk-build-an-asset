export const getS3URL = () => {
  return `https://${import.meta.env.VITE_S3_BUCKET || "sdk-build-an-asset"}.s3.amazonaws.com`;
};
