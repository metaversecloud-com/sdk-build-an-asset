import path from "path";
import express from "express";
import requestID from "express-request-id";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes.js";
import cors from "cors";
import fs from "fs";
import checkEnvVariables from "./utils.js";
dotenv.config();

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_START_DATE = new Date();

checkEnvVariables();
const PORT = process.env.PORT || 3000;
const app = express();
const appVersion = getVersion();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(requestID());

const lockerAssetsPath = path.join(__dirname, "api/locker-app/locker-assets");
app.use("/locker-assets", express.static(lockerAssetsPath));

app.use("/backend", router);

app.get("/", (req, res) => {
  return res.send(`Server is running... ${appVersion}`);
});

app.get("/api/system/health", (req, res) => {
  return res.json({
    NODE_ENV: process.env.NODE_ENV,
    DEPLOYMENT_DATE: SERVER_START_DATE,
    COMMIT_HASH: process.env.COMMIT_HASH ? process.env.COMMIT_HASH : "NOT SET",
    SHOWCASE_WORLDS_URLS: [
      "https://topia.io/snowman-prod",
      "https://topia.io/locker-app-prod",
    ],
    INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
    INSTANCE_PROTOCOL: process.env.INSTANCE_PROTOCOL,
    INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
    IMG_ASSET_ID: process.env.IMG_ASSET_ID,
    S3_BUCKET: process.env.S3_BUCKET,
    PARTICLE_EFFECT_NAME_FOR_EDIT_LOCKER: process.env
      .PARTICLE_EFFECT_NAME_FOR_EDIT_LOCKER
      ? PARTICLE_EFFECT_NAME_FOR_EDIT_LOCKER
      : "NOT SET",
    PARTICLE_EFFECT_NAME_FOR_CLAIM_LOCKER: process.env
      .PARTICLE_EFFECT_NAME_FOR_CLAIM_LOCKER
      ? PARTICLE_EFFECT_NAME_FOR_CLAIM_LOCKER
      : "NOT SET",

    GOOGLESHEETS_CLIENT_EMAIL: process.env.GOOGLESHEETS_CLIENT_EMAIL
      ? "SET"
      : "NOT SET",
    GOOGLESHEETS_SHEET_ID: process.env.GOOGLESHEETS_SHEET_ID
      ? "SET"
      : "NOT SET",
    GOOGLESHEETS_PRIVATE_KEY: process.env.GOOGLESHEETS_PRIVATE_KEY
      ? "SET"
      : "NOT SET",
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.info(`Server listening on ${PORT}, version ${appVersion}`);
});

export function getVersion() {
  try {
    const packageJsonContent = fs.readFileSync(
      path.join(__dirname, "../package.json"),
      "utf8"
    );
    const packageJson = JSON.parse(packageJsonContent);
    const version = packageJson.version;
    return version;
  } catch (error) {
    console.error("Error reading or parsing package.json:", error);
  }
}
