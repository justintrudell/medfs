import * as recordService from "./record_service";
import { clearLogin } from "../utils/loginUtils";
import { ERR_NOT_AUTHORIZED } from "../models/errors";
import { file } from "tmp-promise";
import util from "util";
import fs from "fs";
const exec = util.promisify(require("child_process").exec);

export interface LoginDetails {
  userId: string;
  privateKey: string;
  isDoctor: boolean;
}

export function login(
  username: string,
  password: string
): Promise<LoginDetails> {
  const data = { username, password, remember_me: true };
  return recordService.post(`/login`, data).then(response => {
    if (response.statusCode === 200) {
      return {
        userId: response.body.data.userId,
        privateKey: response.body.data.privateKey,
        isDoctor: response.body.data.isDoctor
      };
    }

    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }

    throw new Error(`Unknown Error: ${response.body}`);
  });
}

// Private key is encrypted with the user's password
export function decryptPk(
  privateKey: string,
  password: string
): Promise<string> {
  return (async () => {
    const { path: pkPath, cleanup: pkFire } = await file({
      mode: 0o644,
      prefix: "medfstmp-"
    });
    await util.promisify(fs.writeFile)(pkPath, privateKey);

    const { path: passwordPath, cleanup: passwordCleanup } = await file({
      mode: 0o644,
      prefix: "medfstmp-"
    });
    await util.promisify(fs.writeFile)(passwordPath, password);

    const decryptedPk = await exec(
      `src/scripts/decrypt_pk.sh "${pkPath}" "${passwordPath}"`
    );

    pkFire();
    passwordCleanup();
    return decryptedPk.stdout;
  })();
}

export function logout(): Promise<boolean> {
  const logoutPromise = recordService
    .post(`/logout`, {})
    .then(response => {
      return response.statusCode === 200;
    })
    .catch(error => {
      console.error(error);
      return false;
    });

  const clearLoginPromise = clearLogin().catch(error => {
    console.error(error);
    return false;
  });

  return Promise.all([logoutPromise, clearLoginPromise]).then(result => {
    return result["0"] && result["1"];
  });
}
