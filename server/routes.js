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

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
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
