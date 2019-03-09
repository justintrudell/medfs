import * as recordService from "./record_service";
import { file } from "tmp-promise";
import * as tmp from "tmp";
import util from "util";
import fs from "fs";
import * as querystring from "querystring";
import { ERR_NOT_AUTHORIZED } from "../models/errors";
import { MedFsNotification, NotificationType } from "../models/notifications";
const execFile = util.promisify(require("child_process").execFile);
// Clean up files even if uncaught exceptions occur
tmp.setGracefulCleanup();

export function getUser(userId: number): recordService.RecordServiceResponse {
  return recordService.get(`/users/${userId}`);
}

export function createUser(
  username: string,
  password: string,
  isDoctor: boolean
): recordService.RecordServiceResponse {
  return (async () => {
    const { path: pwPath, cleanup: pwCleanup } = await file({
      mode: 0o644,
      prefix: "medfstmp-"
    });
    await util.promisify(fs.writeFile)(pwPath, password);
    const { path: privKeyPath, cleanup: privKeyCleanup } = await file({
      mode: 0o644,
      prefix: "medfstmp-"
    });
    await execFile("src/scripts/gen_pk.sh", [pwPath, privKeyPath]);
    const pubKey = await execFile("src/scripts/extract_pub.sh", [
      privKeyPath,
      pwPath
    ]);
    const privKey = await util.promisify(fs.readFile)(privKeyPath);
    pwCleanup();
    privKeyCleanup();
    const data = {
      username,
      password,
      keyPair: {
        private: privKey.toString(),
        public: pubKey.stdout
      },
      isDoctor
    };
    return recordService.post(`/users/create`, data);
  })();
}

export function getKeys(
  emails: string[],
  shouldEmail = false
): Promise<Map<string, string>> {
  return recordService
    .get(`/users/keys?${querystring.stringify({ emails, shouldEmail })}`)
    .then(response => {
      if (response.statusCode === 200) {
        return new Map<string, string>(
          Object.entries(JSON.parse(response.body))
        );
      }

      if (response.statusCode === 401) {
        throw new Error(ERR_NOT_AUTHORIZED);
      }
      if (response.statusCode === 400) {
        throw new Error(response.body);
      }

      throw new Error(`Unknown Error: ${response.body}`);
    });
}

export function testEndpoint(): recordService.RecordServiceResponse {
  return recordService.get(`/users/test`);
}

export function coerceNotification(item: { notificationType: string; createdAt: string }): MedFsNotification {
  return {
    ...item,
    createdAt: new Date(item.createdAt),
    notificationType: item.notificationType as NotificationType
  } as MedFsNotification;
}

export function getNotifications(): Promise<MedFsNotification[]> {
  return recordService.get(`/users/notifications`).then(resp => {
    if (resp.statusCode === 200) {
      return JSON.parse(resp.body).data.map(coerceNotification);
    }

    if (resp.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }

    throw new Error(`Unknown Error: ${resp.body}`);
  });
}
