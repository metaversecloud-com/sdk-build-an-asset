export const getS3URL = () => {
  return `https://${
    process.env.S3_BUCKET_BUILD_AN_ASSET || "sdk-build-an-asset"
  }.s3.amazonaws.com`;
};

export function capitalize(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
