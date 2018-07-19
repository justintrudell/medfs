import { app, remote } from "electron";
import { join } from "path";
const penv = process.env;

const RECORD_SERVICE_HOST = penv.RECORD_SERVICE_HOST || "http://localhost";
const RECORD_SERVICE_PORT = penv.RECORD_SERVICE_PORT || 5000;
const MESSAGE_SERVICE_HOST = penv.MESSAGE_SERVICE_HOST || "http://localhost";
const MESSAGE_SERVICE_PORT = penv.MESSAGE_SERVICE_PORT || 5004;
const userDataPath = (app || remote.app).getPath("userData");
const downloadPath = (app || remote.app).getPath("downloads");

export const constants = {
  RECORD_SERVICE_ENDPOINT: `${RECORD_SERVICE_HOST}:${RECORD_SERVICE_PORT}`,
  MESSAGE_SERVICE_ENDPOINT: `${MESSAGE_SERVICE_HOST}:${MESSAGE_SERVICE_PORT}`,
  LOGGEDIN_USER: "isLoggedIn",
  COOKIE_STORAGE: join(userDataPath, "cookies.json"),
  DOWNLOAD_PATH: downloadPath,
  IS_PROD: penv.MEDFS_ENVIRONMENT === "prod"
};
