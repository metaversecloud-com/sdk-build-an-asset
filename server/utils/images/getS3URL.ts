export const getS3URL = (themeName: string) => {
  return `https://${process.env.S3_BUCKET || "sdk-build-an-asset"}.s3.amazonaws.com/${themeName}`;
};
