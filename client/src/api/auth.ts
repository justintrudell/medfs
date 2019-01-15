import * as recordService from "./record_service";
import { clearLogin } from "../utils/loginUtils";
import { clearPk } from "../utils/pkUtils";
import { ERR_NOT_AUTHORIZED } from "../models/errors";
import { file } from "tmp-promise";
import util from "util";
import fs from "fs";
const exec = util.promisify(require("child_process").exec);

export function login(username: string, password: string): Promise<string> {
  const data = { username, password, remember_me: true };
  return recordService.post(`/login`, data).then(response => {
    if (response.statusCode === 200) {
      return response.body.data.userId;
    }

    if (response.statusCode === 401) {
      throw new Error(ERR_NOT_AUTHORIZED);
    }

    throw new Error(`Unknown Error: ${response.body}`);
  });
}

// Private key is encrypted with our password
export function retrieve_pk(password: string): Promise<string> {
  return (async () => {
    const response = await recordService.get(`/get_pk`, {});
    if (response.statusCode !== 200) {
      throw new Error(`Error retrieving private key: ${response.body}`);
    }

    const body = JSON.parse(response.body)
    const private_key = body.data.private_key;

    const { path: pkPath, cleanup: pkFire } = await file({
      mode: 0o644,
      prefix: "medfstmp-"
    });
    await util.promisify(fs.writeFile)(pkPath, private_key);

    const { path: passwordPath, cleanup: passwordCleanup } = await file({
      mode: 0o644,
      prefix: "medfstmp-"
    });
    await util.promisify(fs.writeFile)(passwordPath, password);

    const decrypted_pk = await exec(`src/scripts/decrypt_pk.sh "${pkPath}" "${passwordPath}"`);

    pkFire();
    passwordCleanup();
    return decrypted_pk;
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

  const clearPkPromise = clearPk().catch(error => {
    console.error(error);
    return false;
  });

  return Promise.all([logoutPromise, clearLoginPromise, clearPkPromise]).then(result => {
    return result["0"] && result["1"];
  });
}
