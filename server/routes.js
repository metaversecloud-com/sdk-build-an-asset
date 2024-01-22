import {
  getVisitor,
  deleteAll,
  spawn,
  spawnFromSpawnedAsset,
  pickup,
  get,
  create,
  getDroppedAssetAndVisitor,
  pickupAllAssets,
  moveToAsset,
  spawnLocker,
  editLocker,
  getLockerDroppedAssetAndVisitor,
  claimLocker,
  renameLocker,
  clearLocker,
  clearAllLockers,
} from "./api/index.js";
import express from "express";
import { validationMiddleware } from "./middleware/validation.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/env", (req, res) => {
  return res.json({
    NODE_ENV: process.env.NODE_ENV,
    INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
    INSTANCE_PROTOCOL: process.env.INSTANCE_PROTOCOL,
    INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
    IMG_ASSET_ID: process.env.IMG_ASSET_ID,
    S3_BUCKET: process.env.S3_BUCKET,
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
router.post("/locker/asset/spawn", validationMiddleware, spawnLocker);
router.put("/locker/asset/spawn", validationMiddleware, editLocker);
router.post("/locker/claim", validationMiddleware, claimLocker);
router.put("/locker/clear", validationMiddleware, clearLocker);
router.put("/locker/clear-all", validationMiddleware, clearAllLockers);
router.post("/locker/rename", validationMiddleware, renameLocker);

router.get(
  "/locker/dropped-asset-and-visitor",
  validationMiddleware,
  getLockerDroppedAssetAndVisitor
);

export default router;
