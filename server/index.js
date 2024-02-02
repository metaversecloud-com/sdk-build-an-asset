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

app.get("/system/health", (req, res) => {
  return res.json({
    appVersion,
    status: "OK",
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
