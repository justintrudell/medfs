import { app, remote } from "electron";
import { join } from "path";
const penv = process.env;

const PROD_CORE_HOST =
  "http://medfs-core-550121771.us-east-1.elb.amazonaws.com";
const PROD_MESSAGE_HOST =
  "http://medfs-message-1212016706.us-east-1.elb.amazonaws.com";
const DEV_HOST = "http://localhost";
const RECORD_SERVICE_PORT = "5000";
const MESSAGE_SERVICE_PORT = "5004";

function service_host(service: "core" | "message"): string {
  if (penv.MEDFS_ENVIRONMENT === "prod") {
    return service === "core" ? PROD_CORE_HOST : PROD_MESSAGE_HOST;
  }
  return DEV_HOST;
}

function record_service_endpoint(): string {
  return `${service_host("core")}:${RECORD_SERVICE_PORT}`;
}

function message_service_endpoint(): string {
  return `${service_host("message")}:${MESSAGE_SERVICE_PORT}`;
}

const userDataPath = (app || remote.app).getPath("userData");
const downloadPath = (app || remote.app).getPath("downloads");

export const constants = {
  record_service_endpoint,
  message_service_endpoint,
  LOGGEDIN_USER: "isLoggedIn",
  COOKIE_STORAGE: join(userDataPath, "cookies.json"),
  DOWNLOAD_PATH: downloadPath,
  IS_PROD: penv.MEDFS_ENVIRONMENT === "prod",
  GET_DB_PATH: (dbName: string) => join(userDataPath, "medfs_db", dbName)
};
