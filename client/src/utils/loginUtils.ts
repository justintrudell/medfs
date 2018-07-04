import * as localForage from "localforage";
import { constants } from "../config";

export function getLogin(): Promise<UserInternal | null> {
  return new Promise((resolve, _reject) => {
    localForage.getItem(constants.LOGGEDIN_USER).then(item => {
      if (!item) {
        resolve(null);
      } else {
        resolve(item as UserInternal);
      }
    });
  });
}
