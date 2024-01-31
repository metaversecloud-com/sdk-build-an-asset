import path from "path";
import express from "express";
import requestID from "express-request-id";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes.js";
import cors from "cors";
import checkEnvVariables from "./utils.js";
import pkg from "./package.json" assert { type: "json" };
dotenv.config();

import { fileURLToPath } from "url";

checkEnvVariables();
const PORT = process.env.PORT || 3000;
const app = express();
const version = "28.0";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(requestID());

app.use("/backend", router);

app.get("/", (req, res) => {
  return res.send(`Server is running... ${version}`);
});

app.get("/system/health", (req, res) => {
  return res.json({
    appVersion: pkg.version,
    status: "OK",
  });
});

if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.resolve(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.info(`Server listening on ${PORT}, version ${version}`);
});
