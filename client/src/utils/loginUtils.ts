import * as localForage from "localforage";
import { constants } from "../config";
import * as _ from "lodash";

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
