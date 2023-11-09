import {
  getVisitor,
  deleteAll,
  spawn,
  pickup,
  get,
  create,
} from "./api/index.js";
import express from "express";
import { validationMiddleware } from "./middleware/validation.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/visitor", getVisitor);

router.get("/asset", validationMiddleware, get);

router.post("/asset/spawn", validationMiddleware, spawn);

export default router;
