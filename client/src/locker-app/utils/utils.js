export const getS3URL = () => {
  return `https://${
    process.env.S3_BUCKET_BUILD_AN_ASSET || "sdk-build-an-asset"
  }.s3.amazonaws.com`;
};
