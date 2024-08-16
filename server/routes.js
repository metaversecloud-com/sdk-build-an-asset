import {
  getVisitor,
  spawnFromSpawnedAsset,
  pickup,
  getAsset,
  getDroppedAssetAndVisitor,
  pickupAllAssets,
  moveToAsset,
  editAsset,
  getWorld,
  clearAsset,
  clearAllAssets,
  getDroppedAsset,
  claimAsset,
  spawnSnowman,
} from "./controllers/index.js";
import express from "express";
import { validationMiddleware } from "./middleware/validation.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/visitor", getVisitor);

router.get("/asset", validationMiddleware, getAsset);

router.get(
  "/dropped-asset-and-visitor",
  validationMiddleware,
  getDroppedAssetAndVisitor
);

router.post(
  "/asset/spawn-from-spawned-asset",
  validationMiddleware,
  spawnFromSpawnedAsset
);

router.post("/asset/pickup-all-assets", validationMiddleware, pickupAllAssets);
router.post("/asset/pickup", validationMiddleware, pickup);

// Asset
router.post("/asset/claim", validationMiddleware, claimAsset);
router.post("/asset/move-to-asset", validationMiddleware, moveToAsset);
router.put("/asset/asset/spawn", validationMiddleware, editAsset);
router.put("/asset/clear", validationMiddleware, clearAsset);
router.put("/asset/clear-all", validationMiddleware, clearAllAssets);
router.get("/asset/world", validationMiddleware, getWorld);
router.get("/asset/dropped-asset", validationMiddleware, getDroppedAsset);
router.put("/asset/spawn-snowman", validationMiddleware, spawnSnowman);

export default router;
