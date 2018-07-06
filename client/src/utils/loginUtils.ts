import * as localForage from "localforage";
import { constants } from "../config";
import * as _ from "lodash";
import { logout } from "../api/auth";

export function getLogin(): Promise<UserInternal | null> {
  return new Promise((resolve, _reject) => {
    localForage.getItem(constants.LOGGEDIN_USER).then(item => {
      if (_.isEmpty(item)) {
        resolve(null);
      } else {
        resolve(item as UserInternal);
      }
    });
  });
}

export function executeLogout(): Promise<boolean> {
  const logoutPromise = logout()
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
