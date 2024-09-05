import express from "express";
import {
  handleClaimDroppedAsset,
  handleClearAllDroppedAssets,
  handleClearDroppedAsset,
  handleDropAsset,
  handleEditDroppedAsset,
  handleGetDroppedAsset,
  handleGetWorldAndVisitor,
  handleMoveToDroppedAsset,
  handlePickupAllDroppedAssets,
  handlePickupDroppedAsset,
} from "./controllers/index.js";
import { getVersion } from "./utils/getVersion.js";

const router = express.Router();
const SERVER_START_DATE = new Date();

router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    envs: {
      NODE_ENV: process.env.NODE_ENV,
      DEPLOYMENT_DATE: SERVER_START_DATE,
      COMMIT_HASH: process.env.COMMIT_HASH ? process.env.COMMIT_HASH : "NOT SET",
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INSTANCE_PROTOCOL: process.env.INSTANCE_PROTOCOL,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      IMG_ASSET_ID: process.env.IMG_ASSET_ID,
      S3_BUCKET: process.env.S3_BUCKET,
      GOOGLESHEETS_CLIENT_EMAIL: process.env.GOOGLESHEETS_CLIENT_EMAIL ? "SET" : "NOT SET",
      GOOGLESHEETS_SHEET_ID: process.env.GOOGLESHEETS_SHEET_ID ? "SET" : "NOT SET",
      GOOGLESHEETS_PRIVATE_KEY: process.env.GOOGLESHEETS_PRIVATE_KEY ? "SET" : "NOT SET",
    },
  });
});

router.get("/world-and-visitor", handleGetWorldAndVisitor);

// Dropped Assets
router.get("/dropped-assets", handleGetDroppedAsset);
router.post("/dropped-assets/claim", handleClaimDroppedAsset);
router.post("/dropped-assets/clear", handleClearDroppedAsset);
router.post("/dropped-assets/clear-all", handleClearAllDroppedAssets);
router.post("/dropped-assets/drop", handleDropAsset);
router.post("/dropped-assets/edit", handleEditDroppedAsset);
router.post("/dropped-assets/move-to", handleMoveToDroppedAsset);
router.post("/dropped-assets/pickup", handlePickupDroppedAsset);
router.post("/dropped-assets/pickup-all", handlePickupAllDroppedAssets);

export default router;
