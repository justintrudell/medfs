import * as recordService from "./record_service";
import * as _ from "lodash";
import { PermissionRequest } from "../models/permissions";
import { tmpName } from "tmp-promise";
import * as fs from "fs";
import util from "util";
import { RecordItem, RecordDetails, RecordKey } from "../models/records";
import { ERR_NOT_AUTHORIZED, ERR_NOT_LOGGED_IN } from "../models/errors";
import * as crypto from "crypto";
import { getLogin } from "../utils/loginUtils";
const execFile = util.promisify(require("child_process").execFile);

type RecordServiceResponse = {
  id: string;
  name: string;
  hash: string;
  created: string;
  permissioned_users: [{ id: string; email: string }];
};

function normalizeRecord(resp: RecordServiceResponse): RecordItem {
  return {
    ...resp,
    created: new Date(resp.created),
    permissionedUsers: resp.permissioned_users
  };
}

function decryptAesKey(encryptedAesKey: string): Promise<string> {
  return new Promise((resolve, reject) =>
    getLogin().then(userInternal => {
      if (!_.isEmpty(userInternal)) {
        resolve(
          crypto
            .privateDecrypt(
              userInternal!.privateKey,
              Buffer.from(encryptedAesKey, "hex")
            )
            .toString("hex")
        );
      } else {
        reject(ERR_NOT_LOGGED_IN);
      }
    })
  );
}

export function getAllForUser(userId?: string): Promise<RecordItem[]> {
  const url = _.isEmpty(userId) ? `/records` : `/patients/records/${userId}`;
  return recordService.get(url).then(response => {
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

export function get(id: string): Promise<RecordDetails> {
  return recordService.get(`/records/${id}`, { json: true }).then(response => {
    if (response.statusCode === 200) {
      return response.body.data;
    }

    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown Error: ${response.body}`);
  });
}

export function encryptFileAndUpload(
  permissions: PermissionRequest[],
  aesKey: string,
  iv: string,
  file: File,
  recordId?: string
): recordService.RecordServiceResponse {
  return (async () => {
    const encFilePath = await tmpName();
    await execFile("src/scripts/encrypt_file.sh", [
      file.path,
      encFilePath,
      aesKey,
      iv
    ]);
    const form = {
      permissions: JSON.stringify(permissions),
      file: fs.createReadStream(encFilePath),
      filename: file.name
    };
    return recordId
      ? recordService.post("/records/update/" + recordId, form, {}, "formData")
      : recordService.post("/records", form, {}, "formData");
  })();
}

// Returns the AES key and IV for a specified record
export function getKeyForRecord(record: string): Promise<RecordKey> {
  return recordService.get(`/record_keys/${record}`).then(response => {
    if (response.statusCode === 200) {
      const ret = JSON.parse(response.body).data;
      return (async () => {
        // Decrypt AES key using user's private key
        const decryptedKey = await decryptAesKey(ret.encryptedAesKey);
        return {
          aesKey: decryptedKey,
          iv: ret.iv
        };
      })();
    }
    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown Error: ${response.body}`);
  });
}

export function deleteRecord(record: string): Promise<void> {
  return recordService.del(`/records/${record}`).then(response => {
    if (response.statusCode === 200) {
      return;
    }
    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }
    throw new Error(`Unknown Error: ${response.body}`);
  });
}
