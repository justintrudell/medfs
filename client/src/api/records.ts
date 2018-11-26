import * as recordService from "./record_service";
import { PermissionRequest } from "../models/permissions";
import { tmpName } from "tmp-promise";
import * as fs from "fs";
import util from "util";
const exec = util.promisify(require("child_process").exec);

export function getAllForUser(): recordService.RecordServiceResponse {
  return recordService.get(`/records`);
}

export function get(id: string): recordService.RecordServiceResponse {
  return recordService.get(`/records/${id}`, { json: true });
}

export function encryptFileAndUpload(
  permissions: PermissionRequest[],
  aesKey: string,
  iv: string,
  extension: string,
  file: File
): recordService.RecordServiceResponse {
  return (async () => {
    const encFilePath = await tmpName();
    await exec(
      `src/scripts/encrypt_file.sh ${file.path} ${encFilePath} ${aesKey} ${iv}`
    );
    const form = {
      permissions: JSON.stringify(permissions),
      extension,
      file: fs.createReadStream(encFilePath),
      filename: file.name
    };
    return recordService.post("/records", form, {}, "formData");
  })();
}
