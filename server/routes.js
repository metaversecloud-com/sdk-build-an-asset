import {
  getVisitor,
  spawn,
  spawnFromSpawnedAsset,
  pickup,
  get,
  getDroppedAssetAndVisitor,
  pickupAllAssets,
  moveToAsset,
  editLocker,
  getWorld,
  clearLocker,
  clearAllLockers,
  moveToLocker,
  getDroppedAsset,
  claimLocker,
} from "./api/index.js";
import express from "express";
import { validationMiddleware } from "./middleware/validation.js";

const SERVER_START_DATE = new Date();
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/env", (req, res) => {
  return res.json({
    DEPLOY_DATE: SERVER_START_DATE,
    NODE_ENV: process.env.NODE_ENV,
    INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
    INSTANCE_PROTOCOL: process.env.INSTANCE_PROTOCOL,
    INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
    IMG_ASSET_ID: process.env.IMG_ASSET_ID,
    S3_BUCKET: process.env.S3_BUCKET,
    PARTICLE_EFFECT_NAME_FOR_EDIT_LOCKER: process.env
      .PARTICLE_EFFECT_NAME_FOR_EDIT_LOCKER
      ? PARTICLE_EFFECT_NAME_FOR_EDIT_LOCKER
      : "UNSET",
    PARTICLE_EFFECT_NAME_FOR_CLAIM_LOCKER: process.env
      .PARTICLE_EFFECT_NAME_FOR_CLAIM_LOCKER
      ? PARTICLE_EFFECT_NAME_FOR_CLAIM_LOCKER
      : "UNSET",

    GOOGLESHEETS_CLIENT_EMAIL: process.env.GOOGLESHEETS_CLIENT_EMAIL
      ? "SET"
      : "UNSET",
    GOOGLESHEETS_SHEET_ID: process.env.GOOGLESHEETS_SHEET_ID ? "SET" : "UNSET",
    GOOGLESHEETS_PRIVATE_KEY: process.env.GOOGLESHEETS_PRIVATE_KEY
      ? "SET"
      : "UNSET",
    COMMIT_HASH: process.env.COMMIT_HASH ? COMMIT_HASH : "UNSET",
  });
});

router.get("/visitor", getVisitor);

router.get("/asset", validationMiddleware, get);

router.get(
  "/dropped-asset-and-visitor",
  validationMiddleware,
  getDroppedAssetAndVisitor
);

router.post("/asset/spawn", validationMiddleware, spawn);
router.post(
  "/asset/spawn-from-spawned-asset",
  validationMiddleware,
  spawnFromSpawnedAsset
);
router.post("/asset/move-to-asset", validationMiddleware, moveToAsset);

router.post("/asset/pickup-all-assets", validationMiddleware, pickupAllAssets);
router.post("/asset/pickup", validationMiddleware, pickup);

// Locker
router.post("/locker/claim", validationMiddleware, claimLocker);
router.post("/locker/move-to-asset", validationMiddleware, moveToLocker);
router.put("/locker/asset/spawn", validationMiddleware, editLocker);
router.put("/locker/clear", validationMiddleware, clearLocker);
router.put("/locker/clear-all", validationMiddleware, clearAllLockers);

router.get("/locker/world", validationMiddleware, getWorld);
router.get("/locker/dropped-asset", validationMiddleware, getDroppedAsset);

export default router;
