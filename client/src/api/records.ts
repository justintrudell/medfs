import * as recordService from "./record_service";
import { PermissionRequest } from "../models/permissions";
import { tmpName } from "tmp-promise";
import * as fs from "fs";
import util from "util";
import { RecordItem } from "../models/records";
import { ERR_NOT_AUTHORIZED } from "../models/errors";
const exec = util.promisify(require("child_process").exec);

type RecordServiceResponse = {
  id: string;
  name: string;
  hash: string;
  created: string;
};

function normalizeRecord(resp: RecordServiceResponse): RecordItem {
  return { ...resp, created: new Date(resp.created) };
}

export function getAllForUser(): Promise<RecordItem[]> {
  return recordService.get(`/records`).then(response => {
    if (response.statusCode === 200) {
      const records = JSON.parse(response.body).data as RecordServiceResponse[];
      return records.map(normalizeRecord);
    }

    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown Error: ${response.body}`);
  });
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
