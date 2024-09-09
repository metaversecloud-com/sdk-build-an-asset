export const getS3URL = () => {
  // if (import.meta.env.VITE_ENV === "development") {
  //   const BASE_URL = window.location.origin;
  //   return `${BASE_URL}/assets`;
  // }
  return `https://${import.meta.env.VITE_S3_BUCKET || "sdk-build-an-asset"}.s3.amazonaws.com`;
};
