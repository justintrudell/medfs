import * as localForage from "localforage";
import * as recordService from "./record_service";
import { ERR_NOT_AUTHORIZED } from "../models/errors";

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

export function logout(): Promise<boolean> {
  const logoutPromise = recordService
    .post(`/logout`, {})
    .then(response => {
      return response.statusCode === 200;
    })
    .catch(error => {
      console.log(error);
      return false;
    });

  const clearPromise = localForage
    .clear()
    .then(() => {
      return true;
    })
    .catch(error => {
      console.log(error);
      return false;
    });

  return Promise.all([logoutPromise, clearPromise]).then(result => {
    return result["0"] && result["1"];
  });
}
