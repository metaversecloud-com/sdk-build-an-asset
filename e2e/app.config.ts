// Per-app settings for the shared platform tests in tests/platform. Every app edits this file;
// the platform specs themselves stay identical across SDK apps.

export type RouteSpec = {
  method: "get" | "post" | "put" | "delete";
  /** Path under /api, without the query string. */
  path: string;
  data?: Record<string, unknown>;
};

const imageInfo = { topLayerInfo: { "Locker Base": [{ imageName: "lockerBase_0.png" }] }, bottomLayerInfo: {} };

/**
 * API routes that read the session credentials (getCredentials). Each one must reject missing or
 * foreign credentials and must never send the interactive secret to the browser. List them all.
 */
export const CREDENTIALED_ROUTES: RouteSpec[] = [
  { method: "get", path: "/world-and-visitor" },
  { method: "post", path: "/dropped-assets/claim" },
  { method: "post", path: "/dropped-assets/clear", data: { isClearAssetFromUnclaimedAsset: false } },
  { method: "post", path: "/dropped-assets/clear-all", data: { shouldDelete: false } },
  { method: "post", path: "/dropped-assets/drop", data: { imageInfo } },
  { method: "post", path: "/dropped-assets/edit", data: { imageInfo, requiredTopLayerCategories: ["Locker Base"] } },
  { method: "post", path: "/dropped-assets/move-to", data: { closeIframeAfterMove: false } },
  { method: "post", path: "/dropped-assets/pickup", data: { isClearAssetFromUnclaimedAsset: false } },
];

/** Page the app opens in its iframe; the platform tests load it with valid credentials. */
export const ENTRY_PAGE = "/locker";
